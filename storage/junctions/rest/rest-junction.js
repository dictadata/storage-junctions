"use strict";

const Storage = require('../../storage');
const StorageJunction = require('../storage-junction');
const { StorageResults, StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');
const { typeOf, replace, httpRequest, contentTypeIsJSON } = require('@dictadata/lib');

const RESTReader = require('./rest-reader');
const RESTWriter = require('./rest-writer');
const RESTEncoder = require('./rest-encoder');

const { pipeline, finished } = require('node:stream/promises');

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
   * @param {string|object} smt 'rest|host|endpoint|key' or an Engram object
   * @param {object}     options
   * @param {URL|string} options.url default smt.schema
   * @param {object}     options.params http querystring params
   * @param {*}          options.data http request body
   * @param {object}     options.http httpRequest options
   * @param {number}     options.retries default 0
   * @param {number}     options.retryTimer default 500 ms
   * @param {boolean}    options.raw return raw response data
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("RESTJunction");

    //this.cookies = [];
    this.retries = options.retries || 0;
    this.retryTimer = options.retryTimer || 500; // milliseconds
  }

  /**
   *  Get the encoding for the storage node.
   *  Possibly make a call to the source to acquire the encoding definitions.
   */
  async getEngram() {
    logger.debug("RESTJunction getEngram");
    if (!this.capabilities.encoding)
      throw new StorageError(405);

    try {
      if (!this.engram.isDefined) {
        // read the stream to infer data types
        // default to 1000 constructs unless overridden in options
        let options = Object.assign({ count: 100 }, this.options);

        let reader = this.createReader(options);
        reader.on('error', (error) => {
          logger.warn("rest codify reader: " + error.message);
        });

        let codify = await Storage.activateTransform("codify", options);
        await pipeline(reader, codify);

        let encoding = codify.encoding;
        this.engram.encoding = encoding;
      }
      return new StorageResults("engram", null, this.engram.encoding);
    }
    catch (err) {
      logger.warn(err.message);
      throw this.StorageError(err);
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
   * @param {object} options optional, options.schema name to use instead of junction's smt.schema
   */
  async dullSchema(options) {
    logger.debug('RESTJunction dullSchema');
    options = Object.assign({}, this.options, options);
    let schema = options?.schema || this.smt.schema;

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
      logger.warn(err.message);
      throw this.StorageError(err);
    }
  }

  async httpRequest(url, request, data) {
    let response = { statusCode: 0 };
    let retries = this.retries;

    while (response.statusCode !== 200 && retries >= 0) {
      response = await httpRequest(url, request, data);

      if (response.statusCode >= 500 && retries > 0) {
        console.warn("REST retry: " + this.retries - retries + 1 + " " + url)
        await new Promise(resolve => setTimeout(resolve, this.retryTimer));
      }
      --retries;
    }

    return response;
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
        baseURL = replace(baseURL, urlReplace);
        url = replace(url, urlReplace);
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

      let response = await this.httpRequest(url, request, data);

      let results;
      if (contentTypeIsJSON(response.headers[ "content-type" ]))
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
      logger.warn(err.message);
      throw this.StorageError(err);
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
        baseURL = replace(baseURL, urlReplace);
        url = replace(url, urlReplace);
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

      let response = await this.httpRequest(url, request, data);

      let results;
      if (contentTypeIsJSON(response.headers[ "content-type" ]))
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
      logger.warn(err.message);
      throw this.StorageError(err);
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
      logger.warn(err.message);
      throw this.StorageError(err);
    }
  }

};

// define module exports
module.exports = exports = RESTJunction;
