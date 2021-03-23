"use strict";

const StorageJunction = require("../storage");
const { typeOf, StorageResults, StorageError } = require("../types");
const logger = require('../logger');

const RESTReader = require("./rest-reader");
const RESTWriter = require("./rest-writer");
const encoder = require('./rest-encoder');

const stream = require('stream/promises');
const http = require("http");


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
    throw new StorageError({ statusCode: 501 }, "RESTJunction.dullSchema method not implemented");

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
      let url = this.options.url || this.engram.smt.schema || '/';
      if (pattern) {
        // querystring parameters
        // url += ???
      }
      let request = {
        method: "GET",
        headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
        auth: this.options.auth || {},
        timeout: this.options.timeout || 10000
      };

      let response = await this._httpRequest(url, request);

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
  
  /////////////////////////

  async _httpRequest(rpath, options, data) {
    return new Promise((resolve, reject) => {
      this.response = {
        data: ""
      };

      let Url;
      try {
        Url = new URL(rpath, this.engram.smt.locus);
      } catch (error) {
        throw new Error(`Invalid url ${rpath}`);
      }

      var request = {
        method: (options.method && options.method.toUpperCase()) || "GET",
        host: Url.hostname,
        port: Url.port,
        path: Url.pathname,
        timeout: options.timeout || 5000
      };
      request.headers = Object.assign({}, this.headers, options.headers);
      if (options.auth)
        request.auth = options.auth;
      if (this.cookies)
        request.headers["Cookie"] = Object.entries(this.cookies).join('; ');
      if (data)
        options.headers['Content-Length'] = Buffer.byteLength(data);

      const req = http.request(request, (res) => {
        this.response.statusCode = res.statusCode;
        this.response.headers = res.headers;
        this._saveCookies(res.headers);
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          this.response.data += chunk;
        });

        res.on('end', () => {
          logger.debug(`\n${this.response.data}`);
          resolve(this.response.data);
        });
      });

      req.on('error', (e) => {
        logger.error(err);
        reject(err);
      });

      if (data)
        req.write(data);
      req.end();
    });
  }

  ////////////////////////////////
  
  _saveCookies(headers) {
    // parse cookies
    for (const name in headers) {
      logger.debug(`${name}: ${headers[name]}`);
      if (name === "set-cookie") {
        let cookies = [];
        let hdval = headers[name];
        if (typeof hdval === 'string')
          cookies.push(hdval);
        else
          cookies = hdval;

        for (let cookie of cookies) {
          let nvs = cookie.split(';');
          if (nvs.length > 0) {
            let ck = nvs[0].split('=');
            if (ck.length > 0) {
              logger.debug(ck[0] + '=' + ck[1]);
              this.cookies[ck[0]] = ck[1];
            }
          }
        }
      }
    }
  }

};


// define module exports
RESTJunction.encoder = encoder;
module.exports = RESTJunction;
