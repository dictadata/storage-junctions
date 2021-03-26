/**
 * elasticsearch/junction
 */
"use strict";

const StorageJunction = require("../storage-junction");
const ElasticsearchReader = require("./elasticsearch-reader");
const ElasticsearchWriter = require("./elasticsearch-writer");
const { StorageResults, StorageError } = require("../../types");
const logger = require('../../logger');

const encoder = require("./elasticsearch-encoder");
const dslEncoder = require("./elasticsearch-encoder-dsl");
const ElasticQuery = require("./elasticsearch-client-query");
const fs = require('fs');
const path = require('path');


class ElasticsearchJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'elasticsearch|node|index|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("ElasticsearchJunction");

    this._readerClass = ElasticsearchReader;
    this._writerClass = ElasticsearchWriter;

    this.encoder = encoder;
    this.storeCount = 0;
  }

  async activate() {
    this._isActive = true;
    this.storeCount = 0;
    this.elasticQuery = new ElasticQuery({ node: this.smt.locus, index: this.smt.schema });
  }

  /**
   * relax the junction, i.e. release resources
   */
  async relax() {
    // release any resources
    this._isActive = false;
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
      logger.debug(response);

      let lines = response.body.split('\n');
      let headers = lines[0].split(/\s+/);
      let i = headers.indexOf('index');

      for (let n = 1; n < lines.length; n++) {
        let values = lines[n].split(/\s+/);
        if (values.length > i) // check for blank line
          list.push(values[i]);
      }

      return new StorageResults(0, null, list);
    }
    catch (err) {
      if (err.statusCode === 404)
        return new StorageResults(0, null, list); // empty list
      
      logger.error(err.statusCode, err.message);
      throw new StorageError(err.statusCode).inner(err);
    }
  }

  /**
   *
   */
  async getEncoding() {
    logger.debug("ElasticJunction get encoding");

    try {
      if (!this.engram.isDefined) {
        // get encoding from elasticsearch
        let mappings = await this.elasticQuery.getMapping();
        // convert to encoding fields
        this.engram.fields = this.encoder.mappingsToFields(mappings);
      }

      return new StorageResults(0, null, this.engram);
    }
    catch (err) {
      if (err.statusCode === 404)  // index_not_found_exception
        return new StorageResults(404, 'index not found');

      logger.error(err.statusCode, err.message);
      throw new StorageError(err.statusCode).inner(err);
    }
  }

  /**
   *
   * @param {*} encoding
   */
  async createSchema(options={}) {
    logger.debug("ElasticJunction createSchema");

    // try to create new index
    try {
      let encoding = options.encoding || this.engram.encoding;
    
      // check if table already exists
      let tables = await this.list();
      if (tables.length > 0) {
        return new StorageResponse(409, 'index exists');
      }

      // load the default config containing index settings
      let defaultMappings = JSON.parse(fs.readFileSync(path.join(__dirname, "default_mappings.json")));
      let indexConfig = Object.assign({}, defaultMappings);
      // overwrite with any member options
      Object.assign(indexConfig, this.options.indexConfig);

      // convert encoding fields to elasticsearch mapping properties
      let mappings = this.encoder.fieldsToMappings(encoding.fields);

      // merge the mappings into the config
      Object.assign(indexConfig.mappings, mappings);

      let response = await this.elasticQuery.createIndex(indexConfig);

      // if successfull update encoding
      this.engram.encoding = encoding;

      return new StorageResponse(0, null, this.engram, "encoding");
    }
    catch (err) {
      if (err.statusCode === 400 && err.message === "resource_already_exists_exception")
        return new StorageResults(409, 'index exists' );

      logger.error(err.statusCode, err.message);
      throw new StorageError(err.statusCode).inner(err);
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

      return new StorageResults(0);
    }
    catch (err) {
      if (err.statusCode === 404)  // index_not_found_exception
        return new ResponseResults( 404, 'index not found' );

      logger.error(err.statusCode, err.message);
      throw new StorageError(err.statusCode).inner(err);
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} pattern optional
   */
  async store(construct, pattern) {
    logger.debug("ElasticJunction store");

    try {
      logger.debug(JSON.stringify(construct));
      let data = dslEncoder.encodeValues(this.engram, construct);
      let key = null;
      let response = null;
      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key') {
        // store by _id
        key = (pattern && pattern.key) || this.engram.get_uid(construct) || null;
        logger.debug(key + " " + JSON.stringify(data));
        response = await this.elasticQuery.put(key, data);
        key = response.body._id;
      }
      else {
        response = await this.elasticQuery.insert(data);
        key = response.body._id;
      }
      this.storeCount++;

      return new StorageResults(response.statusCode, null, response.body.result, key);
    }
    catch (err) {
      logger.error(err.statusCode, err.message);
      throw new StorageError(err.statusCode).inner(err);
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
      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key') {
        // get by _id
        let key = (match.key) || this.engram.get_uid(match) || null;
        if (!key)
          throw new StorageError( 400, "no storage key specified");

        let response = await this.elasticQuery.get(key);
        key = response.body._id || true;

        return new StorageResults(response.statusCode, null, response.body._source, key);
      }
      else if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // search by exact match
        let dsl = dslEncoder.matchQuery(this.engram.keys, pattern);

        logger.verbose(JSON.stringify(dsl));
        let response = await this.elasticQuery.search(dsl);
        let hits = response.body.hits.hits;
        //let keys = (hits[0] && hits[0]._id);

        if (response.body.hits.hits.length > 0)
          return new StorageResults(response.statusCode, null, hits[0]._source);
        else
          return new StorageResults(404);
      }
      else
        return new StorageResults(400, 'invalid key');
    }
    catch (err) {
      logger.error(err.statusCode, err.message);
      throw new StorageError(err.statusCode).inner(err);
    }
  }

  /**
   *
   * @param {*} pattern canc contain match, fields, order, etc. for forming a query
   */
  async retrieve(pattern) {
    logger.debug("ElasticJunction retrieve");

    try {
      let dsl = dslEncoder.searchQuery(pattern);
      logger.verbose(JSON.stringify(dsl));
      let isKeyStore = (this.engram.keyof === 'uid' || this.engram.keyof === 'key');
      let storageResults = new StorageResults(200);

      if (pattern.aggregate) {
        // aggregation response
        let response = await this.elasticQuery.aggregate(dsl);
        let constructs = dslEncoder.processAggregations(response.body.aggregations);
        storageResults.add(constructs);
      }
      else {
        let response = await this.elasticQuery.search(dsl);
        let hits = response.body.hits.hits;
        for (var i = 0; i < hits.length; i++) {
          if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
            storageResults.add(hits[i]._source, hits[i]._id);
          else
            storageResults.add(hits[i]._source);
        }
      }

      if (!storageResults.data) {
        storageResults.resultCode = 404;
        storageResults.resultText = "Not Found";
      }
      return storageResults;
    }
    catch (err) {
      let msg = (err.body && err.body.error.reason) || err.message;
      logger.debug(msg);
      logger.error(err);
      throw new StorageError(err.statusCode, msg).inner(err);
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("ElasticJunction dull");

    try {
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
      else if (this.engram.keyof === 'primary' || this.engram.keyof === 'all') {
        // delete by query
        let dsl = dslEncoder.matchQuery(this.engram.keys, pattern);
        response = await this.elasticQuery.deleteByQuery(dsl);
      }
      else {
        response = await this.elasticQuery.truncate();
      }

      let resultCode = response.body.deleted ? response.statusCode : 404;
      let data = response.body.result ? response.body.result : '';
      return new StorageResults(resultCode, null, data, key);
    }
    catch (err) {
      if (err.statusCode === 404)
        return new StorageResults(404);
      
      logger.error(err.statusCode, err.message);
      throw new StorageError(err.statusCode).inner(err);
    }
  }

};

ElasticsearchJunction.encoder = encoder;
ElasticsearchJunction.dslEncoder = dslEncoder;
module.exports = ElasticsearchJunction;
