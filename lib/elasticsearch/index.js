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
const queryEncoder = require("./encoder_query");
const ElasticQuery = require("./query_elasticsearch");
const fs = require('fs');
const path = require('path');


module.exports = class ElasticsearchJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'elasticsearch|node|index|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);
    logger.debug("ElasticsearchJunction");

    this._readerClass = ElasticsearchReader;
    this._writerClass = ElasticsearchWriter;

    this.encoder = encoder;
    this.elasticQuery = new ElasticQuery({node: this._engram.smt.locus, index: this._engram.smt.schema});
    this.storeCount = 0;
  }

  /**
   * relax the junction, i.e. release resources
   */
  async relax() {
    // release an resources
    try {
      if (this.storeCount) {
        await this.elasticQuery.refresh(this._engram.smt.schema);
        this.storeCount = 0;
      }
    }
    catch (err) {
      logger.debug(err.message);
    }
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
        return 'not found';

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

    // try to create new index
    try {
      // load the default config containing index settings
      let defaultMappings = JSON.parse(fs.readFileSync(path.join(__dirname, "default_mappings.json")));
      let indexConfig = Object.assign({}, defaultMappings);
      // overwrite with any options
      Object.assign(indexConfig, this._options.indexConfig);

      // convert encoding fields to elasticsearch mapping properties
      let mappings = this.encoder.fieldsToMappings(encoding.fields);

      // merge the mappings into the config
      Object.assign(indexConfig.mappings, mappings);

      let results = await this.elasticQuery.createIndex(indexConfig);
      this._engram.replace(encoding);

      return this._engram;
    }
    catch(err) {
      if (err.statusCode === 400  && err.message === "resource_already_exists_exception")
        return 'schema exists';

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
      let keys = null;
      let results = null;
      if (this._engram.keyof === 'uid' || this._engram.keyof === 'key') {
        // store by _id
        let key = (options && options.key) || this._engram.get_uid(construct);
        results = await this.elasticQuery.put(key, construct);
        keys = results._id;
      }
      else {
        results = await this.elasticQuery.insert(construct);
      }
      this.storeCount++;

      let result = (results.result === "created" || results.result === "updated") ? "ok" : "not stored";
      return new StorageResults(result, null, keys, results);
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
        let keys = results._id;

        return new StorageResults(results.found ? 'ok' : 'not found', results._source, keys, results);
      }
      else if (this._engram.keyof === 'list' || this._engram.keyof === 'all') {
        // search by exact match
        let dsl = queryEncoder.matchQuery(this._engram.keys, options);

        logger.verbose(JSON.stringify(dsl));
        let hits = await this.elasticQuery.search(dsl);
        //let keys = (hits[0] && hits[0]._id);

        let result = (hits.length > 0) ? "ok" : "not found";
        return new StorageResults(result, (hits[0] && hits[0]._source) );
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
    let pattern = options && (options.pattern || options || {});

    try {
      let dsl = queryEncoder.searchQuery(pattern);

      let keys = [];
      let constructs = [];
      if (!pattern.consolidate) {
        let hits = await this.elasticQuery.search(dsl);
        for (var i = 0; i < hits.length; i++) {
          keys.push(hits[i]._id);
          constructs.push(hits[i]._source);
        }
      } else {
        // aggregation results
        let results = await this.elasticQuery.aggregate(dsl);
        constructs = queryEncoder.processAggregations(results.aggregations);
      }

      let result = (constructs.length > 0) ? "ok" : "not found";
      if (this._engram.keyof !== 'uid' && this._engram.keyof !== 'key')
        keys = null;
      return new StorageResults(result, constructs, keys, null);
    }
    catch(err) {
      let msg = (err.body && err.body.error.reason) || err.message;
      logger.debug(msg);
      this._logger.error(err.statusCode, msg);
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
        let dsl = queryEncoder.matchQuery(this._engram.keys, options);
        results = await this.elasticQuery.deleteByQuery(dsl);
      }
      else {
        results = await this.elasticQuery.truncate();
      }

      let result = (results.result === 'deleted' || results.deleted > 0) ? "ok" : "not found";
      return new StorageResults(result, null, null, results);
    }
    catch(err) {
      this._logger.error(err.statusCode, err.message);
      throw err;
    }
  }

};
