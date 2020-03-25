"use strict";

const { StorageError } = require("../types");
const logger = require("../logger");


module.exports = exports = class FileStorage {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options) {
    this.smt = SMT;
    this.options = options || {};
    this.logger = this.options.logger || logger;

    this.isActive = false;
    this.isNewFile = false;  // set by createWriteStream()

    this.logger.debug("FileStorage");
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
    this.logger.debug("FileStorage list");
    throw new StorageError({ statusCode: 501 }, "method not implemented");

    //options = Object.assign({}, this.options.list, options);
    //let list = [];

    // implement in overrides

    //return list;
  }

  /**
  * createReadStream
  */
  async createReadStream() {
    this.logger.debug("FileStorage createReadStream");
    throw new StorageError({ statusCode: 501 }, "method not implemented");

    // implement readstream creation in overrides
    //let rs = null;

    //return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream() {
    this.logger.debug("FileStorage createWriteStream")
    throw new StorageError({ statusCode: 501 }, "method not implemented");

    // implement writestream creation in overrides
    //let ws = false;

    //this.isNewFile = true | false

    //return ws;
  }

};
