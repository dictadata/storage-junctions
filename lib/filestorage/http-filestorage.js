"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const Axios = require("axios");
const http2 = require('http2');
const fs = require('fs');
const { PassThrough } = require('stream');
const zlib = require('zlib');


module.exports = exports = class httpFileStorage extends FileStorage {

  /**
   *
   * @param {*} SMT  example "model|url|filename|*"
   * @param {*} options  axios connection options, headers and cookies
   */
  constructor(SMT, options) {
    super(SMT, options);

    logger.debug("httpFileStorage");

    this.headers = Object.assign({}, this.options.headers);
    this.cookies = Object.assign({}, this.options.cookies);
  }

  /**
   *
   */
  async getHTTP() {
    let rs = null;

    try {
      var request = {
        "baseURL": this.options.url || this.smt.locus,
        "headers": {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate',
          "user-agent": "dictadata.org/storage"
        },
        "insecureHTTPParser": true,
        "timeout": 5000
      };

      if (this.options.headers)
        request.headers = Object.assign(request.headers, this.options.headers);

      if (this.options.cookies)
        request.headers["Coookie"] = Object.entries(this.options.cookies).join('; ');

      var axios = await Axios.create(request);
      rs = axios.get();
    }
    catch (err) {
      logger.error(err);
      this.isActive = false;
    }

    return rs;
  }

  async getHTTP2() {
    return new Promise((resolve,reject) => {
    const client = http2.connect(this.options.url || this.smt.locus);

    client.on('error', (err) => console.error(err));
    
    const req = client.request({
      ':path': this.options.path || '/',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language': 'en-US,en;q=0.5',
      'accept-encoding': 'gzip, deflate',
      "user-agent": "dictadata.org/storage"
    });
    
    req.on('response', (headers, flags) => {
      for (const name in headers) {
        console.log(`${name}: ${headers[name]}`);
      }
    });
    
    req.setEncoding('utf8');
    let data = '';
    
    req.on('data', (chunk) => { data += chunk; });
    
    req.on('end', () => {
      console.log(`\n${data}`);
      client.close();
    });
    
    req.end();    
  });

  /**
   *
   * @param {*} options
   */
  async list(options) {
    options = Object.assign({}, this.options, options);
    let list = [];

    try {
      let filespec = options.schema || this.smt.schema || '*';
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      var axios = await this.activate();
      let rs = await axios.get();
      console.log(rs);
      // parse html directory

    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    logger.debug("httpFileStorage createReadStream");
    let options = this.options || {};
    let rs = null;

    try {
      let filename = this.smt.schema;
      var axios = await this.activate();

      await axios.get(filename);

      // create read stream
      //rs = await xyz;

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGunzip();
        rs.pipe(gzip);
        return gzip;
      }
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    logger.debug("httpFileStorage createWriteStream");
    let options = this.options || {};
    let ws = false;

    try {
      let filename = this.smt.schema;
      var axios = await this.activate();

      // create the write stream
      ws = new PassThrough(); // app writes to passthrough and axios reads from passthrough

      if (options.append) {
      }
      else {
      }

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGzip();
        gzip.pipe(ws);
        return gzip;
      }
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    return ws;
  }

};
