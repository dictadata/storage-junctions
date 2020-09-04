"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");
const logger = require("../logger");

const Axios = require("axios");
const { PassThrough } = require('stream');
const zlib = require('zlib');


module.exports = exports = class httpFileStorage extends FileStorage {

  /**
   *
   * @param {*} SMT  example "model|url|filename|*"
   * @param {*} options  axios connection options
   */
  constructor(SMT, options) {
    super(SMT, options);

    this.isActive = false;
    this._axios = null;

    logger.debug("httpFileStorage");
  }

  /**
   *
   */
  async activate() {
    if (this.isActive)
      return this._axios;

    this.isActive = true;
    let options = this.options.http || {};

    try {
      // connect to host
      this._axios = await Axios.create({
        "baseURL": options.url || this.smt.locus || "",
        "headers": {
          "Accept": "text/html",
          "User-Agent": "dictadata.org/storage"
        },
        "insecureHTTPParser": true,
        "timeout": 5000
      });
    }
    catch (err) {
      logger.error(err);
      this.isActive = false;
    }

    return this._axios;
  }

  /**
   *
   */
  async relax() {
    this.isActive = false;
    this._axios = null;
  }

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
