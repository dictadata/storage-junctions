"use strict";

const StorageJunction = require("../junction");
const ElasticsearchReader = require("./reader");
const ElasticsearchWriter = require("./writer");

const Elastic = require("./elastic");
const Mappings = require("./mappings");
const Retrieval = require("./retrieval");

module.exports = class ElasticsearchJunction extends StorageJunction {

  /**
   *
   * @param {*} storagePath 'elasticsearch|host|index|key' or an Engram object
   * @param {*} options
   */
  constructor(storagePath, options = null) {
    super(storagePath, options);
    //console.log("ElasticsearchJunction");

    this._readerClass = ElasticsearchReader;
    this._writerClass = ElasticsearchWriter;

    this.elastic = new Elastic({node: this._encoding.location, index: this._encoding.container});
    this.mapper = new Mappings(this);
    this.retriever = new Retrieval(this);
  }

  /**
   *
   */
  async getEncoding() {
    try {
      let encoding = await this.mapper.getEncoding();
      return encoding;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    try {
      let results = await this.mapper.putEncoding(encoding);
      return results;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
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
        results = await this.elastic.put(key,construct);
      else
        results = await this.elastic.insert(construct);

      return results;
    }
    catch(err) {
      this._logger.error(err.message);
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
      let results = await this.elastic.get(key);
      return results;
    }
    catch(err) {
      this._logger.error(err.message);
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
        results = await this.elastic.delete(key);
      else
        results = await this.elastic.truncate();
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
      this._logger.error(err.message);
      throw err;
    }
  }

};
