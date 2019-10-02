/**
 * elasticsearch/junction
 */
"use strict";

const StorageJunction = require("../junction");
const ElasticsearchReader = require("./reader");
const ElasticsearchWriter = require("./writer");
const {StorageResults, StorageError} = require("../types");
const logger = require('../logger');

const encoder = require("./encoder");
const ElasticQuery = require("./elastic_query");
const elasticEncoder = require("./elastic_encoder");
const defaultMappings = require('./default_mappings');


module.exports = class ElasticsearchJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'elasticsearch|node|index|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    super(storagePath, options);
    logger.debug("ElasticsearchJunction");

    this._readerClass = ElasticsearchReader;
    this._writerClass = ElasticsearchWriter;

    this.encoder = encoder;
    this.elasticQuery = new ElasticQuery({node: this._engram.location, index: this._engram.schema});
  }

  /**
   *
   */
  async getEncoding() {
    logger.debug("ElasticJunction getEncoding");

    try {
      if (!this.active) {
        // get encoding from elasticsearch
        let mappings = await this.elasticQuery.getMapping();
        // convert to encoding fields
        this._engram.fields = this.encoder.mappingsToFields(mappings);
      }
      return this._engram;
    }
    catch(err) {
      if (err.statusCode === 404)  // index_not_found_exception
        return false;

      this._logger.error(err.statusCode, err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    logger.debug("ElasticJunction putEncoding");

    // replace existing field encodings
    this._engram.fields = encoding.fields;

    // try to create new index
    try {
      // load the default config containing index settings
      let indexConfig = Object.assign({}, defaultMappings);
      // overwrite with any options
      Object.assign(indexConfig, this._options.indexConfig);

      // convert encoding fields to elasticsearch mapping properties
      let mappings = this.encoder.fieldsToMappings(encoding.fields);

      // merge the mappings into the config
      Object.assign(indexConfig.mappings, mappings);

      await this.elasticQuery.createIndex(indexConfig);
      return this._engram;
    }
    catch(err) {
      if (err.statusCode === 400)  // already exists
        return false;

      this._logger.error(err.statusCode, err.message);
      throw err;
    }

  }

  /**
   *
   * @param {*} construct
   * @param {*} options optional
   */
  async store(construct, options = null) {
    logger.debug("ElasticJunction store");

    try {
      let results = null;
      if (this._engram.keyof === 'uid' || this._engram.keyof === 'key') {
        // store by _id
        let key = (options && options.key) || this._engram.get_uid(construct);
        results = await this.elasticQuery.put(key, construct);
      }
      else {
        results = await this.elasticQuery.insert(construct);
      }

      return new StorageResults(results.result, null, results._id, results);
    }
    catch(err) {
      this._logger.error(err.statusCode, err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} key optional
   */
  async recall(options = null) {
    logger.debug("ElasticJunction recall");

    try {

      if (this._engram.keyof === 'uid' || this._engram.keyof === 'key') {
        // get by _id
        let key = (options && options.key) || this._engram.get_uid(options);
        if (!key)
          throw new StorageError({ statusCode: 400 }, "no storage key specified");

        let results = await this.elasticQuery.get(key);

        return new StorageResults(results.found ? 'ok' : 'not found', results._source, results._id, results);
      }
      else if (this._engram.keyof === 'list' || this._engram.keyof === 'all') {
        // search by exact match
        let dsl = elasticEncoder.matchQuery(this._engram.keys, options);

        let hits = await this.elasticQuery.search(dsl);

        return new StorageResults((hits.length > 0) ? "ok" : "fail", (hits.length > 0) ? hits[0]._source : null);
      }

      return new StorageResults('invalid', null);
    }
    catch(err) {
      this._logger.error(err.statusCode, err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} options options.pattern
   */
  async retrieve(options = null) {
    logger.debug("ElasticJunction retrieve");
    if (!options) options = {};
    if (!options.pattern) options.pattern = null;

    try {
      let dsl = elasticEncoder.searchQuery(options.pattern);

      let constructs = [];
      if (!options.pattern.consolidate) {
        let hits = await this.elasticQuery.search(dsl);
        for (var i = 0; i < hits.length; i++) {
          constructs.push(hits[i]._source);
        }
      } else {
        // aggregation results
        let aggs = await this.elasticQuery.aggregate(dsl);
        constructs = elasticEncoder.processAggregations(aggs);
      }

      return new StorageResults('ok', constructs, null, null);
    }
    catch(err) {
      logger.debug(err.message);
      this._logger.error(err.statusCode, err.message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(options = null) {
    logger.debug("ElasticJunction dull");

    try {
      let results;

      if (this._engram.keyof === 'uid' || this._engram.keyof === 'key') {
        // delete by _id
        let key = (options && options.key) || this._engram.get_uid(options);
        if (!key)
          throw new StorageError({ statusCode: 400 }, "no storage key specified");

        results = await this.elasticQuery.delete(key);
      }
      else if (this._engram.keyof === 'list' || this._engram.keyof === 'all') {
        // delete by query
        let dsl = elasticEncoder.matchQuery(this._engram.keys, options);
        results = await this.elasticQuery.deleteByQuery(dsl);
      }
      else {
        results = await this.elasticQuery.truncate();
      }

      return new StorageResults(results.result, null, null, results);
    }
    catch(err) {
      this._logger.error(err.statusCode, err.message);
      throw err;
    }
  }

};
