/**
 * elasticsearch/junction
 */
"use strict";

const StorageJunction = require("../junction");
const ElasticsearchReader = require("./reader");
const ElasticsearchWriter = require("./writer");
const defaultMappings = require('./default_mappings');

const encoder = require("./encoder");
const ElasticQuery = require("./elastic_query");
const elasticEncoder = require("./elastic_encoder");

module.exports = class ElasticsearchJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'elasticsearch|node|index|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    super(storagePath, options);
    //console.log("ElasticsearchJunction");

    this._readerClass = ElasticsearchReader;
    this._writerClass = ElasticsearchWriter;

    this.encoder = encoder;
    this.elasticQuery = new ElasticQuery({node: this._engram.location, index: this._engram.schema});
  }

  /**
   *
   */
  async getEncoding() {
    try {
      // get encoding from elasticsearch
      let mappings = await this.elasticQuery.getMapping();
      // convert to encoding fields
      this._engram.encoding.fields = this.encoder.mappingsToFields(mappings);

      return this._engram.encoding;
    }
    catch(err) {
      this._logger.error(err.statusCode, err.Message);
      throw err;
    }
  }

  /**
   *
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    encoding = encoding.encoding || encoding;

    this._engram.encoding.fields = encoding.fields;

    // try to create new index
    try {
      // convert encoding fields to elasticsearch mapping properties
      let mappings = this.encoder.fieldsToMappings(encoding.fields);

      let indexConfig = Object.assign({}, defaultMappings);
      Object.assign(indexConfig.mappings, mappings);

      await this.elasticQuery.createIndex(indexConfig);
      return this._engram;
    }
    catch(err) {
      if (err.statusCode === 400)  // already exists
        return this._engram;

      this._logger.error(err.statusCode, err.Message);
      throw err;
    }

  /*
    try {
      await this.elasticQuery.putMapping(this.mappings);
      return (this._engram);
    }
    catch (err) {
      if (err.statusCode !== 404) {
        logger.error("putEncoding error: ", err.message);
        throw err;
      }
    }
  */
  }

  /**
   *
   * @param {*} construct
   * @param {*} options optional
   */
  async store(construct, options = null) {
    try {
      let results = '';

      let id = this._engram.generateID(construct);
      if (id)
        results = await this.elasticQuery.put(id, construct);
      else
        results = await this.elasticQuery.insert(construct);

      return results._id || false;
    }
    catch(err) {
      this._logger.error(err.statusCode, err.Message);
      throw err;
    }
  }

  /**
   *
   * @param {*} key optional
   */
  async recall(options = null) {
    let id = (options && options.id) || this._engram.id;
    if (!id)
      throw new Error("no storage id specified");

    try {
      let results = await this.elasticQuery.get(id);
      return results._source;
    }
    catch(err) {
      this._logger.error(err.statusCode, err.Message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(options = null) {
    let id = (options && options.id) || this._engram.id;
    if (!id)
      throw "no storage id specified";

    try {
      let results;
      if (id)
        results = await this.elasticQuery.delete(id);
      else
        results = await this.elasticQuery.truncate();
      return results;
    }
    catch(err) {
      this._logger.error(err.statusCode, err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern, options = null) {
    console.log("retrieve");

    try {
      let constructs = [];
      let dsl = elasticEncoder.transform(pattern);

      if (!pattern.consolidate) {
        let hits = await this.elasticQuery.search(dsl);
        for (var i = 0; i < hits.length; i++) {
          constructs.push(hits[i]._source);
        }
      } else {
        // aggregation results
        let aggs = await this.elasticQuery.aggregate(dsl);
        constructs = elasticEncoder.processAggregations(aggs);
      }

      return constructs;
    }
    catch(err) {
      console.log(err.message);
      this._logger.error(err.statusCode, err.Message);
      throw err;
    }
  }

};
