/**
 * dictadata/storage/filesystems/storage-filesystem
 */
"use strict";

const { parseSMT, StorageResponse, StorageError } = require("../types");
const { logger } = require("../utils");

const path = require('path');

module.exports = exports = class StorageFileSystem {

  /**
   * construct a StorageFileSystem object
   * @param {*} SMT storage memory trace
   * @param {*} options filesystem options
   */
  constructor(SMT, options) {
    logger.debug("StorageFileSystem");

    this.smt = parseSMT(SMT);
    this.options = Object.assign({}, options);

    // convert smt.locus to a URL
    // default protocol is "file:""
    // protocol must be at least two characters plus ':' 
    // one character prefix is treated as a Windows drive letter, e.g. C:\

    let locus = this.smt.locus
    if (locus.startsWith("file:"))
      locus = "file:" + path.resolve(locus.substr(5));
    else if (this.smt.locus.indexOf(':') <= 1)
      locus = "file:" + path.resolve(locus);
    
    this.url = new URL(locus);
    logger.debug("filesystem: " + JSON.stringify(this.url));

    this.isActive = false;
    this.isNewFile = false;  // set by createWriteStream()
  }

  /**
   * Initialize or connect to the filesystem
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
   * List files located in the folder specified in smt.locus.  smt.schema is a filename that may contain wildcard characters.
   * @param {object} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema, my contain wildcard characters.
   * @param {boolean} options.recursive Scan the specified folder and all sub-folders.
   * @param {function} options.forEach Function to execute with each entry object, optional.
   * @returns StorageResponse object where data is an array of directory entry objects.
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

  /**
   * Remove schema, i.e. file(s), on the filesystem.
   * Depending upon the filesystem may be a delete, mark for deletion, erase, etc.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @returns StorageResponse object with resultCode.
   */
  async dull(schema) {
    logger.debug("StorageFileSystem dull");
    throw new StorageError(501);

    // return newStorageResponse(0);
  }

  /**
   * Create an object mode readstream from the filesystem file.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @returns a node.js readstream based object if successful.
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
   * Create an object mode writestream to the filesystem file.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with filename at the same locus.
   * @param {*} options.append Flag used indicate overwrite or append destination file. Default is overwrite.
   * @returns a node.js writestream based object if successful.
  */
  async createWriteStream(options) {
    logger.debug("StorageFileSystem createWriteStream")
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let ws = false;

    // implement writestream creation in overrides
    //this.isNewFile = true | false

    //return ws;
  }

  /**
   * Download a file from remote filesystem to local filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {SMT} options.smt smt.locus specifies the output folder in the local filesystem.
   * @param {boolean} options.keep_rpath If true replicate folder structure of remote filesystem in local filesystem.
   * @returns StorageResponse object with resultCode;
   */
  async geFile(options) {
    logger.debug("StorageFileSystem getFile");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return new StorageResponse(0);
  }

  /**
   * Upload a local file to the remote filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {SMT} options.smt smt.locus specifies the source folder in the local filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {boolean} options.keep_rpath If true replicate folder structure of local filesystem in remote filesystem.
   * @returns StorageResponse object with resultCode.
   */
  async putFile(options) {
    logger.debug("StorageFileSystem putFile");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options.schema || this.smt.schema;
    //let result = false;

    //return new StorageResponse(0);
  }

};
