"use strict";

const logger = require("../logger");
const { StorageError } = require("../types");

module.exports = exports = class FileStorage {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options = null) {
    this._smt = SMT;
    this._options = options || {};
    this._logger = this._options.logger || logger;

    this.isNewFile = false;  // set by createWriteStream()

    this._logger.debug("FileStorage");
  }

  async scan() {
    this._logger.debug("FileStorage scan");
    throw new StorageError({ statusCode: 501 }, "method not implemented");

    // implement scan in overrides
    //let list = [];

    //return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    this._logger.debug("FileStorage createReadStream");
    throw new StorageError({ statusCode: 501 }, "method not implemented");

    // implement readstream creation in overrides
    //let rs = null;

    //return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    this._logger.debug("FileStorage createWriteStream")
    throw new StorageError({ statusCode: 501 }, "method not implemented");

    // implement writestream creation in overrides
    //let ws = false;

    //this.isNewFile = true | false

    //return ws;
  }

};
