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

    this._isActive = false;
    this._isNewFile = false;  // set by createWriteStream()

    logger.debug("FileSystem");
  }

  /**
   * Initialize or connect to the file storage system
   */
  async activate() {
    // optional, implement filesystem initialization
    this._isActive = true;
  }

  /**
   * Diconnect and/or cleanup resources
   */
  async relax() {
    // optional, implement filesystem cleanup
    this._isActive = false;
  }

  /**
   * list returns an array of directory objects for the locus.
   * 
   * @param {*} options 
   */
  async list(options) {
    logger.debug("FileSystem list");
    throw new StorageError({ statusCode: 501 }, "FileSystem.list method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let list = [];

    // implement directory list in overrides

    //return list;
  }

  /**
  * createReadStream
  */
  async createReadStream(options) {
    logger.debug("FileSystem createReadStream");
    throw new StorageError({ statusCode: 501 }, "FileSystem.createReadStream method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let rs = null;

    // implement readstream creation in overrides

    //return rs;
  }

  /**
  * createWriteStream
  */
  async createWriteStream(options) {
    logger.debug("FileSystem createWriteStream")
    throw new StorageError({ statusCode: 501 }, "FileStoreage.createWriteStream method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let ws = false;

    // implement writestream creation in overrides
    //this._isNewFile = true | false

    //return ws;
  }

  async download(options) {
    logger.debug("FileSystem download");
    throw new StorageError({ statusCode: 501 }, "FileStoreage.download method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return result;
  }

  async upload(options) {
    logger.debug("FileSystem upload");
    throw new StorageError({ statusCode: 501 }, "FileStoreage.upload method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return result;
  }

};
