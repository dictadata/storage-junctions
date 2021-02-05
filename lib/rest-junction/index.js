"use strict";

const StorageJunction = require("../storage-junction");
const encoder = require('./encoder');
const RestReader = require("./reader");
const RestWriter = require("./writer");
const { typeOf, StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const stream = require('stream/promises');
const Axios = require("axios");


module.exports = exports = class RestJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'rest|host|endpoint|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
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
      if (!this.engram.isDefined) {
        // read the stream to infer data types
        // default to 1000 constructs unless overridden in options
        let reader = this.createReadStream(this.options || { max_read: 100 });
        let codify = this.createTransform('codify', this.options || {});

        await stream.pipeline(reader, codify);
        let encoding = await codify.getEncoding();
        this.engram.replace(encoding);
      }
      return this.engram;
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async putEncoding(encoding, overlay=false) {
    if (overlay) {
      this.engram.replace(encoding);
      return this.engram;
    }
    
    try {
      this.engram.replace(encoding);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    if (typeOf(construct) !== "object")
      throw new StorageError({ statusCode: 400 }, "Invalid parameter: construct is not an object");

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async recall(pattern) {
    if (!this.engram.smt.key) {
      throw "no storage key specified";
    }

    try {
      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {

    try {
      let axiosOptions = {
        baseURL: this.engram.smt.locus,
        headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
        auth: this.options.auth || {},
        params: this.options.params || {},
        timeout: this.options.timeout || 10000
      };

      let url = this.options.url || this.engram.smt.schema || '';
      let response = await Axios.get(url, axiosOptions);

      let constructs = [];
      encoder.parseData(response.data, this.options, (construct) => {
        constructs.push(construct);
      });

      return new StorageResults((constructs.length > 0) ? 'ok' : "not found", constructs);
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   *
   */
  async dull(pattern) {
    try {
      if (this.engram.smt.key) {
        // delete construct by key
      }
      else {
        // delete all constructs in the .schema
      }

      return new this.StorageResults('invalid');
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

};
