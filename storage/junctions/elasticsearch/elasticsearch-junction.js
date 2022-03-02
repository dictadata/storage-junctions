/**
 * elasticsearch/junction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const ElasticsearchReader = require("./elasticsearch-reader");
const ElasticsearchWriter = require("./elasticsearch-writer");
const { StorageResponse, StorageError } = require("../../types");
const { logger } = require('../../utils');

const encoder = require("./elasticsearch-encoder");
const dslEncoder = require("./elasticsearch-encoder-dsl");
const ElasticQuery = require("./elasticsearch-client-query");
const fs = require('fs');
const path = require('path');


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
   * @param {*} SMT 'elasticsearch|node|index|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("ElasticsearchJunction");

    this.encoder = encoder;
    this.storeCount = 0;
  }

  async activate() {
    this.isActive = true;
    this.storeCount = 0;

    let queryOptions = {
      node: this.smt.locus,
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
    logger.debug('ElasticJunction list');

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;
      let list = [];

      // get Lucene catalog list of indexes
      let response = await this.elasticQuery.cat(schema);
      // response is a table in one long string
      //logger.debug(response);

      let lines = response.body.split('\n');
      let headers = lines[ 0 ].split(/\s+/);
      let i = headers.indexOf('index');

      for (let n = 1; n < lines.length; n++) {
        let values = lines[ n ].split(/\s+/);
        if (values.length > i) // check for blank line
          list.push(values[ i ]);
      }

      return new StorageResponse(0, null, list);
    }
    catch (err) {
      if (err.statusCode === 404)
        return new StorageResponse(0, null, []); // empty list

      logger.error(err.message);
      throw new StorageError(err.statusCode || 500, err.message).inner(err);
    }
  }

  /**
   *
   */
  async getEncoding() {
    logger.debug("ElasticJunction get encoding");

    try {
      // get encoding from elasticsearch
      let mappings = await this.elasticQuery.getMapping();
      // convert to encoding fields
      this.engram.encoding = this.encoder.mappingsToFields(mappings);

      return new StorageResponse(0, null, this.engram.encoding, "encoding");
    }
    catch (err) {
      if (err.statusCode === 404)  // index_not_found_exception
        return new StorageResponse(404, 'index not found');

      logger.error(err.message);
      throw new StorageError(err.statusCode || 500, err.message).inner(err);
    }
  }

  /**
   *
   * @param {*} encoding
   */
  async createSchema(options = {}) {
    logger.debug("ElasticJunction createSchema");

    // try to create new index
    try {
      let encoding = options.encoding || this.engram.encoding;

      // check if table already exists
      let { data: tables } = await this.list();
      if (tables.length > 0) {
        return new StorageResponse(409, 'index exists');
      }

      // load the default config containing index settings
      let defaultMappings = JSON.parse(fs.readFileSync(path.join(__dirname, "default_mappings.json")));
      let indexConfig = Object.assign({}, defaultMappings);
      // overwrite with any options properties
      Object.assign(indexConfig, this.options.indexConfig);

      // convert encoding fields to elasticsearch mapping properties
      let mappings = this.encoder.fieldsToMappings(encoding.fields);

      // merge the mappings into the config
      Object.assign(indexConfig.mappings, mappings);

      let response = await this.elasticQuery.createIndex(indexConfig);

      // if successfull update encoding
      this.engram.encoding = encoding;

      return new StorageResponse(0, null, this.engram.encoding, "encoding");
    }
    catch (err) {
      if (err.statusCode === 400 && err.message === "resource_already_exists_exception")
        return new StorageResponse(409, 'index exists');

      logger.error(err.message);
      throw new StorageError(err.statusCode || 500, err.message).inner(err);
    }
  }

  /**
   *
   */
  async dullSchema(options) {
    logger.debug("ElasticJunction dullSchema");

    try {
      options = Object.assign({}, this.options, options);
      let schema = options.schema || this.smt.schema;

      let response = await this.elasticQuery.deleteIndex(schema);

      return new StorageResponse(0);
    }
    catch (err) {
      if (err.statusCode === 404)  // index_not_found_exception
        return new StorageResponse(404, 'index not found');

      logger.error(err.message);
      throw new StorageError(err.statusCode || 500, err.message).inner(err);
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} pattern optional
   */
  async store(construct, pattern) {
    logger.debug("ElasticJunction store");
    //logger.debug(JSON.stringify(construct));

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let data = dslEncoder.encodeValues(this.engram, construct);
      let key = null;
      let response = null;
      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key') {
        // store by _id
        key = (pattern && pattern.key) || this.engram.get_uid(construct) || null;
        //logger.debug(key + " " + JSON.stringify(data));
        response = await this.elasticQuery.put(key, data);
        key = response.body._id;
      }
      else {
        response = await this.elasticQuery.insert(data);
        key = response.body._id;
      }
      this.storeCount++;

      return new StorageResponse(response.statusCode, null, response.body.result, key);
    }
    catch (err) {
      logger.error(err.message);
      throw new StorageError(err.statusCode || 500, err.message).inner(err);
    }
  }

  /**
   *
   * @param {*} key optional
   */
  async recall(pattern) {
    logger.debug("ElasticJunction recall");
    const match = (pattern && pattern.match) || pattern || {};

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key') {
        // get by _id
        let key = (match.key) || this.engram.get_uid(match) || null;
        if (!key)
          throw new StorageError(400, "no storage key specified");

        let response = await this.elasticQuery.get(key);
        key = response.body._id || true;

        return new StorageResponse(response.statusCode, null, response.body._source, key);
      }
      else if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // search by exact match
        let dsl = dslEncoder.matchQuery(this.engram.keys, pattern);

        logger.verbose(JSON.stringify(dsl));
        let response = await this.elasticQuery.search(dsl);
        let hits = response.body.hits.hits;
        //let keys = (hits[0] && hits[0]._id);

        if (response.body.hits.hits.length > 0)
          return new StorageResponse(response.statusCode, null, hits[ 0 ]._source);
        else
          return new StorageResponse(404);
      }
      else
        return new StorageResponse(400, 'invalid key');
    }
    catch (err) {
      if (err.statusCode === 404)
        return new StorageResponse(404);

      logger.error(err.message);
      throw new StorageError(err.statusCode || 500, err.message).inner(err);
    }
  }

  /**
   *
   * @param {*} pattern canc contain match, fields, order, etc. for forming a query
   */
  async retrieve(pattern) {
    logger.debug("ElasticJunction retrieve");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      let dsl = dslEncoder.searchQuery(pattern);
      logger.verbose(JSON.stringify(dsl));
      let isKeyStore = (this.engram.keyof === 'uid' || this.engram.keyof === 'key');
      let storageResponse = new StorageResponse(0);

      if (pattern.aggregate) {
        // aggregation response
        let response = await this.elasticQuery.aggregate(dsl);
        let constructs = dslEncoder.processAggregations(response.body.aggregations);
        storageResponse.add(constructs);
      }
      else {
        let response = await this.elasticQuery.search(dsl);
        let hits = response.body.hits.hits;
        for (var i = 0; i < hits.length; i++) {
          if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
            storageResponse.add(hits[ i ]._source, hits[ i ]._id);
          else
            storageResponse.add(hits[ i ]._source);
        }
      }

      if (!storageResponse.data) {
        storageResponse.resultCode = 404;
        storageResponse.resultText = "Not Found";
      }
      return storageResponse;
    }
    catch (err) {
      let msg = (err.body && err.body.error.reason) || err.message;
      logger.debug(msg);
      logger.error(err);
      throw new StorageError(err.statusCode || 500, msg).inner(err);
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("ElasticJunction dull");

    try {
      if (!this.engram.isDefined)
        await this.getEncoding();

      const match = (pattern && pattern.match) || pattern || {};
      let response;

      let key;
      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key') {
        // delete by _id
        key = (match.key) || this.engram.get_uid(match) || null;
        if (!key)
          throw new StorageError(400, "no storage key specified");

        response = await this.elasticQuery.delete(key);
      }
      else if (this.engram.keyof === 'primary') {
        // delete by query
        let dsl = dslEncoder.matchQuery(this.engram.keys, pattern);
        response = await this.elasticQuery.deleteByQuery(dsl);
        logger.debug(response);
      }
      else {
        response = await this.elasticQuery.truncate();
        logger.debug(response);
      }

      let storageResponse = new StorageResponse(response.statusCode);
      if (response.body.result)
        storageResponse.add(response.body.result, key);
      else if (response.body.deleted)
        storageResponse.add(response.body.deleted, "deleted");
      return storageResponse;
    }
    catch (err) {
      if (err.statusCode === 404)
        return new StorageResponse(404);

      logger.error(err.message);
      throw new StorageError(err.statusCode || 500, err.message).inner(err);
    }
  }

};

ElasticsearchJunction.encoder = encoder;
ElasticsearchJunction.dslEncoder = dslEncoder;
module.exports = ElasticsearchJunction;
