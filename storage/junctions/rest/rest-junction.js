"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../../types");
const { typeOf, logger, httpRequest } = require("../../utils");

const RESTReader = require("./rest-reader");
const RESTWriter = require("./rest-writer");
const encoder = require('./rest-encoder');

const stream = require('stream/promises');

class RESTJunction extends StorageJunction {

  /**
   *
   * @param {*} SMT 'rest|host|endpoint|key' or an Engram object
   * @param {*} options
   */
  constructor(SMT, options) {
    super(SMT, options);
    logger.debug("RESTJunction");

    this._readerClass = RESTReader;
    this._writerClass = RESTWriter;

    //this.cookies = [];
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
      return new StorageResults(0, null, this.engram.encoding, "encoding");
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   * Sets the encoding for the storage node.
   * Possibly sending the encoding definitions to the source.
   * @param {*} encoding
   */
  async createSchema(options = {}) {
    return super.createSchema(options);
  }

  /**
   * Dull a schema at the locus. 
   * Junction implementations will translate to delete file, DROP TABLE, delete index, etc.
   * @param {Object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('RESTJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options.schema || this.smt.schema;

    // junctions that don't use filesystems should override the dullSchema() method
    throw new StorageError(501);

    //return result;
  }

  /**
   *
   * @param {*} construct
   */
  async store(construct, pattern) {
    if (typeOf(construct) !== "object")
      throw new StorageError( 400, "Invalid parameter: construct is not an object");

    try {
      throw new StorageError(501);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   */
  async recall(pattern) {
    if (!this.engram.smt.key) {
      throw new StorageError(400, "no storage key specified");
    }

    try {
      throw new StorageError(501);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {

    try {
      let url = this.options.url || this.engram.smt.schema || '';
      if (pattern) {
        // querystring parameters
        // url += ???
      }
      
      let request = {
        method: this.options.method || "GET",
        origin: this.options.origin || this.smt.locus,
        headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
        timeout: this.options.timeout || 10000
      };
      if (this.options.auth)
        request["auth"] = this.options.auth;

      let response = await httpRequest(url, request);

      let data;
      if (httpRequest.contentTypeIsJSON(response.headers["content-type"]))
        data = JSON.parse(response.data);
      else
        data = response.data;

      let constructs = [];
      encoder.parseData(data, this.options, (construct) => {
        constructs.push(construct);
      });

      let resultCode = (constructs.length === 0) ? 404 : response.statusCode;
      return new StorageResults(resultCode, null, constructs);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
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

      throw new StorageError(501);
    }
    catch (err) {
      logger.error(err);
      throw new StorageError(500).inner(err);
    }
  }
  
};

// define module exports
RESTJunction.encoder = encoder;
module.exports = RESTJunction;
