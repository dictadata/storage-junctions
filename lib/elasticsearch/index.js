/**
 * elasticsearch/junction
 */
"use strict";

const StorageJunction = require("../junction");
const ElasticsearchReader = require("./reader");
const ElasticsearchWriter = require("./writer");
const defaultMappings = require('./default_mappings');

const encoder = require("./encoder");
const ElasticQuery = require("./query_elastic");

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
    this.elasticQuery = new ElasticQuery({node: this._encoding.location, index: this._encoding.schema});
  }

  /**
   *
   */
  async getEncoding() {
    try {
      // get encoding from elasticsearch
      let mappings = await this.elasticQuery.getMapping();
      // convert to encoding fields
      this._encoding.fields = this.encoder.mappingsToFields(mappings);
      return this._encoding;
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
    this._encoding.fields = encoding.fields;

    // try to create new index
    try {
      // convert encoding fields to elasticsearch mapping properties
      let mappings = this.encoder.fieldsToMappings(encoding.fields);

      let indexConfig = Object.assign({}, defaultMappings);
      Object.assign(indexConfig.mappings, mappings);

      await this.elasticQuery.createIndex(indexConfig);
      return this._encoding;
    }
    catch(err) {
      if (err.statusCode === 400)  // already exists
        return this._encoding;

      this._logger.error(err.statusCode, err.Message);
      throw err;
    }

  /*
    try {
      await this.elasticQuery.putMapping(this.mappings);
      return (this._encoding);
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
    let key = '';
    if (options && options.key)
      key = options.key;
    else {
      // check this._encoding.key to see if we should generate a key
    }

    try {
      let results = '';
      if (key)
        results = await this.elasticQuery.put(key,construct);
      else
        results = await this.elasticQuery.insert(construct);

      return results;
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
    let key = options && options.key || this._encoding.key;
    if (!key) throw "no storage key specified";

    try {
      let results = await this.elasticQuery.get(key);
      return results;
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
    let key = options && options.key || this._encoding.key;
    if (!key) throw "no storage key specified";

    try {
      let results;
      if (key)
        results = await this.elasticQuery.delete(key);
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
      let constructs = await this.retriever.access(pattern);
      return constructs;
    }
    catch(err) {
      console.log(err.message);
      this._logger.error(err.statusCode, err.Message);
      throw err;
    }
  }

};
