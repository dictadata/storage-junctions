"use strict";

const { StorageError } = require("../types");
const logger = require("../logger");


module.exports = exports = class FileSystem {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options) {
    this.smt = SMT;
    this.options = options || {};

    this.isActive = false;
    this.isNewFile = false;  // set by createWriteStream()

    logger.debug("FileSystem");
  }

  /**
   * Initialize or connect to the file storage system
   */
  async activate() {
    // may or may not be implmented by the file storage system
    this.isActive = true;
  }

  /**
   * Diconnect and/or cleanup resources
   */
  async relax() {
    // may or may not be implmented by the file storage system
    this.isActive = false;
  }

  async list(options) {
    logger.debug("FileSystem list");
    throw new StorageError({ statusCode: 501 }, "FileSystem.list method not implemented");

    //options = Object.assign({}, this.options, options);
    //let list = [];

    // implement in overrides

    //return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    logger.debug("FileSystem createReadStream");
    throw new StorageError({ statusCode: 501 }, "FileSystem.createReadStream method not implemented");

    // implement readstream creation in overrides
    //let rs = null;

    //return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    logger.debug("FileSystem createWriteStream")
    throw new StorageError({ statusCode: 501 }, "FileStoreage.createWriteStream method not implemented");

    // implement writestream creation in overrides
    //let ws = false;

    //this.isNewFile = true | false

    //return ws;
  }

};
