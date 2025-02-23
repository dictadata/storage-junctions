/**
 * elasticsearch/junction
 */
"use strict";

const StorageJunction = require('../storage-junction');
const ElasticsearchReader = require('./elasticsearch-reader');
const ElasticsearchWriter = require('./elasticsearch-writer');
const { StorageResults, StorageError } = require('../../types');
const { logger, objCopy } = require('@dictadata/lib');

const encoder = require('./elasticsearch-encoder');
const dslEncoder = require('./elasticsearch-encoder-dsl');
const ElasticQuery = require('./elasticsearch-query');
const { readFile } = require('node:fs/promises');
const path = require('node:path');


class ElasticsearchJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: false, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: true,   // supports key-value storage

    encoding: true,   // get encoding from source
    reader: true,     // stream reader
    writer: true,     // stream writer
    store: true,      // store/recall individual constructs
    query: true,      // select/filter data at source
    aggregate: true   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = ElasticsearchReader;
  _writerClass = ElasticsearchWriter;

  /**
   *
   * @param {*} smt 'elasticsearch|node|index|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("ElasticsearchJunction");

    this.encoder = encoder;
    this.storeCount = 0;
  }

  get isKeyStore() {
    return this.engram.keyof === 'uid' || this.engram.keyof === 'key';
  }

  async activate() {
    this.isActive = true;
    this.storeCount = 0;

    let queryOptions = {
      node: this.smt.locus,
      auth: this.options.auth || {},
      tls: this.options.tls || this.options.ssl || {},
      index: this.smt.schema
    };
    if (this.options.refresh) {
      // refresh index on inserts
      // note, slows down elasticsearch
      queryOptions[ "refresh" ] = 'true';
    }

    this.elasticQuery = new ElasticQuery(queryOptions);
  }

  /**
   * relax the junction, i.e. release resources
   */
  async relax() {
    // release any resources
    this.isActive = false;
    try {
      if (this.storeCount) {
        await this.elasticQuery.refresh(this.smt.schema);
      }
    }
    catch (err) {
      logger.debug(err.message);
    }
  }

  /**
   * Return list of schema names found in the data source like files or tables.
   * smt.schema or options.schema should contain a wildcard character *.
   * Returns list of schema names found.
   * If options.forEach is defined it is called for each schema found and
   * the returned list will be empty.
   * @param {*} options list options
   */
  async list(options) {
    logger.debug('ElasticsearchJunction list');

    try {
      options = objCopy({}, this.options, options);
      let schema = options?.schema || this.smt.schema;
      let list = [];

      // get Lucene catalog list of indexes
      let index = schema.replace(/\?+/g, '*'); // cat query doesn't support '?' (because it's in a URL???)
      let catalog = await this.elasticQuery.cat(index);
      //logger.debug(response);

      let rx = '^' + schema + '$';
      rx = rx.replace(/\./g, '\\.');
      rx = rx.replace(/\?/g, '.');
      rx = rx.replace(/\*/g, '.*');
      rx = new RegExp(rx);

      for (let entry of catalog) {
        if (rx.test(entry[ 'index' ]))
          list.push(entry[ 'index' ]);
      }

      return new StorageResults(0, null, list);
    }
    catch (err) {
      if (err.statusCode === 404)
        return new StorageResults(0, null, []); // empty list

      logger.warn(err.message);
      throw new StorageError(err.statusCode || 500, err.message, { cause: err });
    }
  }

  /**
   *
   */
  async getEngram() {
    logger.debug("ElasticsearchJunction getEngram");

    try {
      // get encoding from elasticsearch
      let mappings = await this.elasticQuery.getMapping();
      // convert to encoding fields
      this.engram.encoding = this.encoder.propertiesToFields(mappings?.properties);

      return new StorageResults("engram", null, this.engram.encoding);
    }
    catch (err) {
      if (err.statusCode === 404)  // index_not_found_exception
        return new StorageResults(404, 'index not found');

      logger.warn(err.message);
      throw new StorageError(err.statusCode || 500, err.message, { cause: err });
    }
  }

  /**
   *
   * @param {*} encoding
   */
  async createSchema(options = {}) {
    logger.debug("ElasticsearchJunction createSchema");

    // try to create new index
    try {
      let encoding = options.encoding || this.engram.encoding;

      // check if table already exists
      let { data: tables } = await this.list();
      if (tables.length > 0) {
        return new StorageResults(409, 'index exists');
      }

      // load the default config containing index settings
      let defaultMappings = JSON.parse(await readFile(path.join(__dirname, "default_mappings.json")));
      let indexConfig = objCopy({}, defaultMappings);
      // overwrite with any options properties
      objCopy(indexConfig.settings, this.options.indexSettings);

      // convert encoding fields to elasticsearch mapping properties
      let properties = this.encoder.fieldsToProperties(encoding.fields);

      // set the mappings.settings into the config
      objCopy(indexConfig.mappings.properties, properties);

      let response = await this.elasticQuery.createIndex(indexConfig);

      // if successful update encoding
      this.engram.encoding = encoding;

      return new StorageResults(response.acknowledged ? 0 : 500);
    }
    catch (err) {
      if (err.statusCode === 400 && err.message === "resource_already_exists_exception")
        return new StorageResults(409, 'index exists');

      logger.warn(err.message);
      throw new StorageError(err.statusCode || 500, err.message, { cause: err });
    }
  }

  /**
   *
   */
  async dullSchema(options) {
    logger.debug("ElasticsearchJunction dullSchema");

    try {
      options = objCopy({}, this.options, options);
      let schema = options?.schema || this.smt.schema;

      let response = await this.elasticQuery.deleteIndex(schema);

      return new StorageResults(0);
    }
    catch (err) {
      if (err.statusCode === 404)  // index_not_found_exception
        return new StorageResults(404, 'index not found');

      logger.warn(err.message);
      throw new StorageError(err.statusCode || 500, err.message, { cause: err });
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} pattern optional
   */
  async store(construct, pattern) {
    logger.debug("ElasticsearchJunction store");
    //logger.debug(JSON.stringify(construct));

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      if (this.options.update) {
        let orig;
        if (this.isKeyStore) {
          let key = pattern?.key || this.engram.get_uid(construct) || null;
          let results = await this.recall({ key: key });
          if (results.status === 0 || results.status === 200)
            orig = results.data[ key ];
        }
        else {
          let results = await this.recall(construct);
          if (results.status === 0 || results.status === 200)
            orig = results.data;
        }
        if (orig)
          construct = objCopy(orig, construct);
      }

      let data = dslEncoder.encodeValues(this.engram, construct);
      let response = null;
      if (this.isKeyStore) {
        // store by _id
        let key = pattern?.key || this.engram.get_uid(construct) || null;
        //logger.debug(key + " " + JSON.stringify(data));
        response = await this.elasticQuery.put(key, data);
      }
      else {
        response = await this.elasticQuery.insert(data);
      }

      this.storeCount++;
      if (this.isKeyStore)
        return new StorageResults("message", null, response.result, response._id);
      else
        return new StorageResults("message", null, { "stored": 1 })
    }
    catch (err) {
      logger.warn("elasticsearch store: " + err.message);
      throw new StorageError(err.statusCode || 500, err.message, { cause: err });
    }
  }

  /**
   *
   * @param {*} key optional
   */
  async recall(pattern) {
    logger.debug("ElasticsearchJunction recall");
    const match = pattern?.match || pattern || {};

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      if (this.isKeyStore) {
        // get by _id
        let key = (match.key) || this.engram.get_uid(match) || null;
        if (!key)
          throw new StorageError(400, "no storage key specified");

        let response = await this.elasticQuery.get(key);
        key = response._id || true;

        return new StorageResults(0, "", response._source, key);
      }
      else if (this.engram.keyof === 'primary' || this.engram.keyof === '*') {
        // search by exact match
        let dsl = dslEncoder.matchQuery(this.engram.keys, pattern);

        logger.debug("dsl: "+ JSON.stringify(dsl));
        let response = await this.elasticQuery.search(dsl);
        let hits = response.hits.hits;
        //let keys = (hits[0] && hits[0]._id);

        if (response.hits.hits.length > 0)
          return new StorageResults("construct", null, hits[ 0 ]._source);
        else
          return new StorageResults(404);
      }
      else
        return new StorageResults(400, 'invalid key');
    }
    catch (err) {
      if (err.statusCode === 404)
        return new StorageResults(404);

      logger.warn(err.message);
      throw new StorageError(err.statusCode || 500, err.message, { cause: err });
    }
  }

  /**
   *
   * @param {*} pattern can contain match, fields, order, etc. for forming a query
   */
  async retrieve(pattern) {
    logger.debug("ElasticsearchJunction retrieve");

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      let dsl = dslEncoder.searchQuery(pattern);
      logger.debug("dsl: " + JSON.stringify(dsl));
      let storageResults;

      if (pattern?.aggregate) {
        // aggregation response
        let response = await this.elasticQuery.aggregate(dsl);
        let constructs = dslEncoder.processAggregations(response.aggregations);
        storageResults = new StorageResults(0, "OK", constructs);
      }
      else {
        let response = await this.elasticQuery.search(dsl);
        let hits = response.hits.hits;
        storageResults = new StorageResults(this.isKeyStore ? "map" : "list");
        for (var i = 0; i < hits.length; i++) {
          if (this.isKeyStore)
            storageResults.add(hits[ i ]._source, hits[ i ]._id);
          else
            storageResults.add(hits[ i ]._source);
        }
      }

      if (!storageResults.data)
        storageResults.setResults(404, "Not Found");
      return storageResults;
    }
    catch (err) {
      let msg = err.body?.error?.reason || err.message;
      logger.warn(msg);
      throw new StorageError(err.statusCode || 500, msg, { cause: err });
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("ElasticsearchJunction dull");

    try {
      if (!this.engram.isDefined)
        await this.getEngram();

      const match = pattern?.match || pattern || {};
      let response;

      let key = this.isKeyStore ? (match.key) || this.engram.get_uid(match) : null;

      if (match === "*") {
        // delete all docs
        response = await this.elasticQuery.truncate();
        logger.debug(response);
      }
      else if (key) {
        // delete by _id
        response = await this.elasticQuery.delete(key);
      }
      else if (Object.keys(match).length > 0) {
        // delete by query
        let dsl = dslEncoder.matchQuery(this.engram.keys, pattern);
        response = await this.elasticQuery.deleteByQuery(dsl);
        logger.debug(response);
      }

      let storageResults = new StorageResults("message");
      if (response.result)
        storageResults.add(response.result, key);
      else if (Object.hasOwn(response, "deleted"))
        storageResults.add(response.deleted, "deleted");
      return storageResults;
    }
    catch (err) {
      if (err.statusCode === 404)
        return new StorageResults(404);

      logger.warn(err.message);
      throw new StorageError(err.statusCode || 500, err.message, { cause: err });
    }
  }

};

ElasticsearchJunction.encoder = encoder;
ElasticsearchJunction.dslEncoder = dslEncoder;
module.exports = exports = ElasticsearchJunction;
