"use strict";

const FileStorage = require("./index");
const { StorageError } = require("../types");

const ftp = require("ftp-ts");
const zlib = require('zlib');


module.exports = exports = class ftpFileStorage extends FileStorage {

  /**
   *
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);

    this.active = false;

    this.logger.debug("ftpFileStorage");
  }

  async activate() {
    this.active = true;
  }

  async relax() {
    this.active = false;
  }

  async scan() {
    let list = [];

    try {
      let ftpPath = this.smt.locus.substring(4);  // remove "ftp:"

      let filespec = this.options.filespec || this.smt.schema;
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // get list


    }
    catch (err) {
      this.logger.error(err.message);
      throw err;
    }

    return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    this.logger.debug("ftpFileStorage createReadStream");
    let rs = null;

    try {
      let filename = this.smt.schema;

      // create the read stream

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGunzip();
        rs.pipe(gzip);
        return gzip;
      }
    }
    catch (err) {
      this.logger.error(err.message);
      throw err;
    }

    return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    this.logger.debug("ftpFileStorage createWriteStream")
    let ws = false;

    try {
      let filename = this.smt.schema;

      // check if file exists
      this.isNewFile = false;  // or true

      // create the write stream

      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGzip();
        gzip.pipe(ws);
        return gzip;
      }
    }
    catch (err) {
      this.logger.error(err.message);
      throw err;
    }

    return ws;
  }

};
