// filesystems/storage-filesystem
"use strict";

const { StorageResponse, StorageError } = require("../types");
const { logger } = require("../utils");

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
    this.options = Object.assign({}, options);

    // convert smt.locus to a URL
    // default protocol is file:
    // protocol must be at least two characters. 
    // One character is treated as a Windows drive, e.g.C: \
    if (this.smt.locus.indexOf(':') > 1)
      this._url = new URL(this.smt.locus);
    else
      this._url = new URL("file:" + path.resolve(this.smt.locus));
    logger.debug("filesystem: " + JSON.stringify(this._url));

    this.isActive = false;
    this._isNewFile = false;  // set by createWriteStream()

    logger.debug("StorageFileSystem");
  }

  /**
   * Initialize or connect to the file storage system
   */
  async activate() {
    // optional, implement filesystem initialization
    this.isActive = true;
  }

  /**
   * Diconnect and/or cleanup resources
   */
  async relax() {
    // optional, implement filesystem cleanup
    this.isActive = false;
  }

  /**
   * list returns an array of directory objects for the locus.
   * 
   * @param {*} options 
   */
  async list(options) {
    logger.debug("StorageFileSystem list");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let list = [];

    // implement directory list in overrides

    //return new StorageResponse(0, null, list);
  }

  async dull(schema) {
    logger.debug("StorageFileSystem dull");
    throw new StorageError(501);

    // return newStorageResponse(0);
  }

  /**
  * createReadStream
  */
  async createReadStream(options) {
    logger.debug("StorageFileSystem createReadStream");
    throw new StorageError(501);

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
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let ws = false;

    // implement writestream creation in overrides
    //this._isNewFile = true | false

    //return ws;
  }

  async download(options) {
    logger.debug("StorageFileSystem download");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return new StorageResponse(0);
  }

  async upload(options) {
    logger.debug("StorageFileSystem upload");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return new StorageResponse(0);
  }

};
