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
const dslQuery = require("./dsl_query");
const ElasticQuery = require("./elastic_query");
const fs = require('fs');
const path = require('path');


module.exports = exports = class ElasticsearchJunction extends StorageJunction {

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
    this.isActive = true;

    this.elasticQuery = new ElasticQuery({node: this.smt.locus, index: this.smt.schema});
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
        this.storeCount = 0;
      }
    }
    catch (err) {
      logger.debug(err.message);
    }

    super.relax();
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
    options = Object.assign({}, options, this.options.list);
    let schema = options.schema || this.smt.schema;
    let list = [];

    try {
      // get Lucene catalog list of indexes
      let results = await this.elasticQuery.cat(schema);
      // results is a table in one long string
      logger.debug(results);

      let lines = results.split('\n');
      let headers = lines[0].split(/\s+/);
      let i = headers.indexOf('index');

      for (let n = 1; n < lines.length; n++) {
        let values = lines[n].split(/\s+/);
        if (values.length > i) // check for blank line
          list.push(values[i]);
      }
    }
    catch(err) {
      logger.error(err.statusCode, err.message);
      throw err;
    }

    return list;
  }

  /**
   *
   */
  async getEncoding() {
    logger.debug("ElasticJunction getEncoding");

    try {
      if (!this.engram.defined) {
        // get encoding from elasticsearch
        let mappings = await this.elasticQuery.getMapping();
        // convert to encoding fields
        this.engram.fields = this.encoder.mappingsToFields(mappings);
      }
      return this.engram;
    }
    catch(err) {
      if (err.statusCode === 404)  // index_not_found_exception
        return 'not found';

      logger.error(err.statusCode, err.message);
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
      // overwrite with any member options
      Object.assign(indexConfig, this.options.indexConfig);

      // convert encoding fields to elasticsearch mapping properties
      let mappings = this.encoder.fieldsToMappings(encoding.fields);

      // merge the mappings into the config
      Object.assign(indexConfig.mappings, mappings);

      let results = await this.elasticQuery.createIndex(indexConfig);
      this.engram.replace(encoding);

      return this.engram;
    }
    catch(err) {
      if (err.statusCode === 400  && err.message === "resource_already_exists_exception")
        return 'schema exists';

      logger.error(err.statusCode, err.message);
      throw err;
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
      let key = null;
      let results = null;
      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key') {
        // store by _id
        key = (pattern && pattern.key) || this.engram.get_uid(construct) || null;
        results = await this.elasticQuery.put(key, construct);
        key = results._id;
      }
      else {
        results = await this.elasticQuery.insert(construct);
        key = results._id;
      }
      this.storeCount++;

      let result = (results.result === "created" || results.result === "updated") ? "ok" : "not stored";
      return new StorageResults(result, results.result, key, (this.options.meta ? results : null));
    }
    catch(err) {
      logger.error(err.statusCode, err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} key optional
   */
  async recall(pattern) {
    logger.debug("ElasticJunction recall");

    try {
      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key') {
        // get by _id
        let key = (pattern && pattern.key) || this.engram.get_uid(pattern) || null;
        if (!key)
          throw new StorageError({ statusCode: 400 }, "no storage key specified");

        let results = await this.elasticQuery.get(key);
        key = results._id;

        return new StorageResults(results.found ? 'ok' : 'not found', results._source, key, (this.options.meta ? results : null));
      }
      else if (this.engram.keyof === 'list' || this.engram.keyof === 'all') {
        // search by exact match
        let dsl = dslQuery.matchQuery(this.engram.keys, pattern);

        logger.verbose(JSON.stringify(dsl));
        let hits = await this.elasticQuery.search(dsl);
        //let keys = (hits[0] && hits[0]._id);

        if (hits.length > 0)
          return new StorageResults("ok", hits[0]._source, null, (this.options.meta ? hits[0] : null) );
        else
          return new StorageResults("not found");
      }
      else
        return new StorageResults('invalid key');
    }
    catch(err) {
      logger.error(err.statusCode, err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern Should contain a match, filter and cues members
   */
  async retrieve(pattern) {
    logger.debug("ElasticJunction retrieve");

    try {
      let dsl = dslQuery.searchQuery(pattern);
      let storageResults = new StorageResults("error");

      if (pattern.consolidate) {
        // aggregation results
        let results = await this.elasticQuery.aggregate(dsl);
        let constructs = dslQuery.processAggregations(results.aggregations);
        storageResults.add(constructs);
      }
      else {
        let hits = await this.elasticQuery.search(dsl);
        for (var i = 0; i < hits.length; i++) {
          if (this.engram.keyof === 'uid' || this.engram.keyof === 'key')
            storageResults.add(hits[i]._source, hits[i]._id);
          else
            storageResults.add(hits[i]._source);
        }
      }

      storageResults.result = storageResults.data ? "ok" : "not found";
      return storageResults;
    }
    catch(err) {
      let msg = (err.body && err.body.error.reason) || err.message;
      logger.debug(msg);
      logger.error(err.statusCode, msg);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern) {
    logger.debug("ElasticJunction dull");

    try {
      let results;

      if (this.engram.keyof === 'uid' || this.engram.keyof === 'key') {
        // delete by _id
        let key = (pattern && pattern.key) || this.engram.get_uid(pattern) || null;
        if (!key)
          throw new StorageError({ statusCode: 400 }, "no storage key specified");

        results = await this.elasticQuery.delete(key);
      }
      else if (this.engram.keyof === 'list' || this.engram.keyof === 'all') {
        // delete by query
        let dsl = dslQuery.matchQuery(this.engram.keys, pattern);
        results = await this.elasticQuery.deleteByQuery(dsl);
      }
      else {
        results = await this.elasticQuery.truncate();
      }

      let result = (results.result === 'deleted' || results.deleted > 0) ? "ok" : "not found";
      return new StorageResults(result, null, null, (this.options.meta ? results : null));
    }
    catch(err) {
      logger.error(err.statusCode, err.message);
      throw err;
    }
  }

};
