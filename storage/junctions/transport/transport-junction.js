"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../../types");
const { typeOf } = require("../../utils");
const logger = require('../../logger');

const TransportReader = require("./transport-reader");
const TransportWriter = require("./transport-writer");
const encoder = require('./transport-encoder');

const stream = require('stream/promises');
const Axios = require("axios");


class TransportJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'transport|host|endpoint|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("TransportJunction");

    this._readerClass = TransportReader;
    this._writerClass = TransportWriter;
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
        let options = Object.assign({ max_read: 100 }, this.options);        
        let reader = this.createReadStream(options);
        let codify = this.createTransform('codify', options);

        await stream.pipeline(reader, codify);
        let encoding = codify.encoding;
        this.engram.encoding = encoding;
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
  async createSchema(options={}) {
    return super.createSchema(options);
  }

  /**
   * Dull a schema at the locus. 
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('TransportJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;

    // junctions that don't use filesystems should override the dullSchema() method
    throw new StorageError({ statusCode: 501 }, "TransportJunction.dullSchema method not implemented");

    //return result;
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

// define module exports
TransportJunction.encoder = encoder;
module.exports = TransportJunction;
