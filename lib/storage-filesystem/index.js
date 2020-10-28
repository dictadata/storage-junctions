"use strict";

const { StorageError } = require("../types");
const logger = require("../logger");

const path = require('path');
const url = require('url');


module.exports = exports = class StorageFileSystem {

  /**
   *
   * @param {*} SMT
   * @param {*} options
   */
  constructor(SMT, options) {
    this.smt = SMT;
    this.options = options || {};

    // convert smt.locus to a URL
    // default protocol is file:
    // protocol must be at least two characters. 
    // One character is treated as a Windows drive, e.g.C: \
    if (this.smt.locus.indexOf(':') > 1)
      this._url = new URL(this.smt.locus);
    else
      this._url = new URL("file:" + path.resolve(this.smt.locus));
    logger.verbose(JSON.stringify(this._url));

    this._isActive = false;
    this._isNewFile = false;  // set by createWriteStream()

    logger.debug("StorageFileSystem");
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
    logger.debug("StorageFileSystem list");
    throw new StorageError({ statusCode: 501 }, "StorageFileSystem.list method not implemented");

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
    logger.debug("StorageFileSystem createReadStream");
    throw new StorageError({ statusCode: 501 }, "StorageFileSystem.createReadStream method not implemented");

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
    logger.debug("StorageFileSystem createWriteStream")
    throw new StorageError({ statusCode: 501 }, "StorageFileSystem.createWriteStream method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let ws = false;

    // implement writestream creation in overrides
    //this._isNewFile = true | false

    //return ws;
  }

  async download(options) {
    logger.debug("StorageFileSystem download");
    throw new StorageError({ statusCode: 501 }, "StorageFileSystem.download method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return result;
  }

  async upload(options) {
    logger.debug("StorageFileSystem upload");
    throw new StorageError({ statusCode: 501 }, "StorageFileSystem.upload method not implemented");

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return result;
  }

};
