"use strict";

const FileStorage = require("./index");
const zlib = require('zlib');

const { StorageError } = require("../types");

module.exports = exports = class ftpFileStorage extends FileStorage {

  /**
   *
   * @param {*} options
   */
  constructor(SMT, options = null) {
    super(SMT, options);

    this._logger.debug("ftpFileStorage");
  }

  async scan() {
    let list = [];

    try {
      let ftpPath = this._smt.locus.substring(4);  // remove "ftp:"

      let filespec = this._options.filespec || this._smt.schema;
      let rx = '^' + filespec + '$';
      rx = rx.replace('.', '\\.');
      rx = rx.replace('*', '.*');
      rx = new RegExp(rx);

      // do something
      this.isNewFile = false;  // or true


    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }

    return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    this._logger.debug("ftpFileStorage createReadStream");
    let rs = null;

    try {
      let filename = this._smt.schema;


      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGunzip();
        rs.pipe(gzip);
        return gzip;
      }
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }

    return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    this._logger.debug("ftpFileStorage createWriteStream")
    let ws = false;

    try {
      let filename = this._smt.schema;


      ///// check for zip
      if (filename.endsWith('.gz')) {
        var gzip = zlib.createGzip();
        gzip.pipe(ws);
        return gzip;
      }
    }
    catch (err) {
      this._logger.error(err.message);
      throw err;
    }

    return ws;
  }

};
