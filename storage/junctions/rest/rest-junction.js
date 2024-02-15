"use strict";

const StorageJunction = require("../storage-junction");
const { StorageResults, StorageError } = require("../../types");
const { typeOf, logger, httpRequest, templateReplace } = require("../../utils");

const RESTReader = require("./rest-reader");
const RESTWriter = require("./rest-writer");
const RESTEncoder = require('./rest-encoder');

const stream = require('stream/promises');

class RESTJunction extends StorageJunction {

  // storage capabilities, sub-class must override
  capabilities = {
    filesystem: false, // storage source is filesystem
    sql: false,        // storage source is SQL
    keystore: false,   // supports key-value storage

    encoding: false,   // get encoding from source
    reader: true,     // stream reader
    writer: false,     // stream writer
    store: false,      // store/recall individual constructs
    query: true,      // select/filter data at source
    aggregate: false   // aggregate data at source
  }

  // assign stream constructor functions, sub-class must override
  _readerClass = RESTReader;
  _writerClass = RESTWriter;
  _encoderClass = RESTEncoder;

  /**
   *
   * @param {*} smt 'rest|host|endpoint|key' or an Engram object
   * @param {*} options
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("RESTJunction");

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

        let reader = this.createReader(options);
        reader.on('error', (error) => {
          logger.warn("rest codify reader: " + error.message);
        });

        let codify = await this.createTransform('codify', options);
        await stream.pipeline(reader, codify);

        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }
      return new StorageResults("encoding", null, this.engram.encoding);
    }
    catch (err) {
      logger.warn(err);
      throw this.Error(err);
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
    let schema = options?.schema || options?.name || this.smt.schema;

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
      throw new StorageError(400, "Invalid parameter: construct is not an object");

    try {
      throw new StorageError(501);
    }
    catch (err) {
      logger.warn(err);
      throw this.Error(err);
    }
  }

  /**
   *
   */
  async recall(pattern) {
    pattern = pattern || {};

    if (!this.engram.smt.key) {
      throw new StorageError(400, "no storage key specified");
    }

    try {
      let baseURL = this.smt.locus;
      let url = this.options.url || this.engram.smt.schema || '';
      let urlReplace = pattern.urlReplace || this.options.urlReplace;
      if (urlReplace) {
        baseURL = templateReplace(baseURL, urlReplace);
        url = templateReplace(url, urlReplace);
      }

      let encoder = this.createEncoder({ pattern: pattern });

      let request = Object.assign({
        method: "GET",
        base: baseURL,
        headers: {
          'Accept': 'application/json',
          'User-Agent': '@dictadata.net/storage'
        },
        timeout: 10000
      }, this.options.http || {});

      let data = this.options.data;

      // pattern will override options
      if (pattern) {
        let params = pattern.params || pattern.match || this.options.params;
        if (request.method === "GET")
          request.params = params  // querystring
        else
          data = params;
      }

      let response = await httpRequest(url, request, data);

      let results;
      if (httpRequest.contentTypeIsJSON(response.headers[ "content-type" ]))
        results = JSON.parse(response.data);
      else
        results = response.data;

      let constructs = [];
      encoder.parseData(results, this.options, (construct) => {
        constructs.push(construct);
      });

      let storageResults;
      if (constructs.length)
        storageResults = new StorageResults("construct", null, constructs[0]);
      else
        storageResults = new StorageResults(404);
      return storageResults;
    }
    catch (err) {
      logger.warn(err);
      throw this.Error(err);
    }
  }

  /**
   *
   * @param {*} pattern
   */
  async retrieve(pattern) {
    pattern = pattern || {};

    try {
      let baseURL = this.smt.locus;
      let url = this.options.url || this.engram.smt.schema || '';
      let urlReplace = pattern.urlReplace || this.options.urlReplace;
      if (urlReplace) {
        baseURL = templateReplace(baseURL, urlReplace);
        url = templateReplace(url, urlReplace);
      }

      let encoder = this.createEncoder({ pattern: pattern });

      let request = Object.assign({
        method: "GET",
        base: baseURL,
        headers: {
          'Accept': 'application/json',
          'User-Agent': '@dictadata.net/storage'
        },
        timeout: 10000
      }, this.options.http || {});

      let data = this.options.data;

      // pattern will override options
      if (pattern) {
        let params = pattern.params || pattern.match || this.options.params;
        if (request.method === "GET")
          request.params = params  // querystring
        else
          data = params;
      }

      let response = await httpRequest(url, request, data);

      let results;
      if (httpRequest.contentTypeIsJSON(response.headers[ "content-type" ]))
        results = JSON.parse(response.data);
      else
        results = response.data;

      let constructs = [];
      encoder.parseData(results, this.options, (construct) => {
        construct = encoder.cast(construct);
        construct = encoder.filter(construct);
        construct = encoder.select(construct);
        if (construct)
          constructs.push(construct);
      });

      let storageResults;
      if (constructs.length)
        storageResults = new StorageResults(response.statusCode, null, constructs);
      else
        storageResults = new StorageResults(404);
      return storageResults;
    }
    catch (err) {
      logger.warn(err);
      throw this.Error(err);
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
      logger.warn(err);
      throw this.Error(err);
    }
  }

};

// define module exports
module.exports = RESTJunction;
