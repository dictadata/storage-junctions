"use strict";

const StorageJunction = require("../junction");
const encoder = require('./encoder');
const RestReader = require("./reader");
const RestWriter = require("./writer");
const { StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const stream = require('stream');
const util = require('util');
const Axios = require("axios");

const pipeline = util.promisify(stream.pipeline);

module.exports = exports = class RestJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'rest|host|endpoint|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);
    logger.debug("RestJunction");

    this._readerClass = RestReader;
    this._writerClass = RestWriter;
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEncoding() {

    try {
      if (!this._engram.defined) {
        // read the stream to infer data types
        // default to 1000 constructs unless overridden in options
        let reader = this.getReadStream(this._options.reader || { max_read: 100 });
        let codify = this.getCodifyWriter(this._options.codify || {});

        await pipeline(reader, codify);
        let encoding = await codify.getEncoding();
        this._engram.replace(encoding);
      }
      return this._engram;
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding) {
    try {
      this._engram.replace(encoding);
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern=null) {
    if (typeof construct !== "object")
      throw new StorageError({statusCode: 400}, "Invalid parameter: construct is not an object");

    try {
      return new this.StorageResults('invalid');
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async recall(pattern=null) {
    if (!this._engram.smt.key) {
      throw "no storage key specified";
    }

    try {
      return new this.StorageResults('invalid');
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern=null) {

    try {
      let axiosOptions = {
        baseURL: this._engram.smt.locus,
        headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage-node' }, this._options.headers),
        auth: this._options.auth || {},
        params: this._options.params || {},
        timeout: this._options.timeout || 10000
      };

      let url = this._options.url || this._engram.smt.schema || '/';
      let response = await Axios.get(url, axiosOptions);

      let constructs = [];
      encoder.parseData(response.data, this._options.reader, (construct) => {
        constructs.push(construct);
      });

      return new StorageResults((constructs.length > 0) ? 'ok' : "not found", constructs);
    }
    catch(err) {
      this._logger.error(err.message);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern=null) {
    try {
      if (this._engram.smt.key) {
        // delete construct by key
      }
      else {
        // delete all constructs in the .schema
      }

      return new this.StorageResults('invalid');
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }
  }

};
