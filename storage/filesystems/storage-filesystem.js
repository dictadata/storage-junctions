/**
 * storage/filesystems/storage-filesystem
 */
"use strict";

const { SMT, StorageError } = require('../types');
const { logger } = require('@dictadata/storage-lib');

const path = require('node:path');

class StorageFileSystem {

  /**
   * construct a StorageFileSystem object
   * @param {*} smt storage memory trace
   * @param {*} options filesystem options
   */
  constructor(smt, options) {
    logger.debug("StorageFileSystem");

    this.smt = new SMT(smt);
    this.options = Object.assign({}, options);

    // convert smt.locus to a URL
    // default protocol is "file:"
    // protocol must be at least two characters plus ':'
    // one character fstype is treated as a Windows drive letter, e.g. C:\
    let locus = this.smt.locus;

    // get fstype
    let fstype = "file";
    let posPrefix = locus.indexOf(":");
    if (posPrefix > 1) {    // ignore drive letters
      fstype = locus.substring(0, posPrefix);
    }
    if (!StorageFileSystem.fileSystemModels.includes(fstype))
      throw new StorageError(400, "Invalid filesystem type " + fstype);

    // ensure local paths are properly formatted
    if (fstype === "file") {
      if (locus.startsWith("file:"))
        locus = locus.substring(5);

      if (this.options.dataPath) {
        // locus is relative to dataPath

        // no drive letters or back steps
        if (locus.indexOf("..") >= 0 || (locus.length > 1 && locus[1] === ":"))
          throw new StorageError(400, "Invalid locus path " + locus);

        // prepend dataPath to locus
        locus = path.join(this.options.dataPath, locus);
      }

      locus = "file:" + path.resolve(locus);
    }

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
/*
  filepath(filename = "") {
    return path.join(this.url.pathname, filename);
  }
*/
  /**
   * List files located in the folder specified in smt.locus.  smt.schema is a filename that may contain wildcard characters.
   * @param {object} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema, my contain wildcard characters.
   * @param {boolean} options.recursive Scan the specified folder and all sub-folders.
   * @param {function} options.forEach Function to execute with each entry object, optional.
   * @returns StorageResults object where data is an array of directory entry objects.
   */
  async list(options) {
    logger.debug("StorageFileSystem list");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options?.schema ||  this.smt.schema;
    //let list = [];

    // implement directory list in overrides

    //return new StorageResults(0, null, list);
  }

  /**
   * Check existence of file in filesystem.
   * List files located in the folder specified in smt.locus.  smt.schema is a filename that may contain wildcard characters.
   * @param {object} options Specify any options use when querying the filesystem.
   * @param {string} options.schema Override smt.schema, my contain wildcard characters.
   * @param {boolean} options.recursive Scan the specified folder and all sub-folders.
   * @param {function} options.forEach Function to execute with each entry object, optional.
   * @returns StorageResults object where data is an array of directory entry objects.
   */
  async exists(options) {
    logger.debug("StorageFileSystem exists");

    try {
      const name = options?.schema ||  this.smt.schema;

      const response = await this.list(options);
      const list = response.data;

      const found = list.find((entry) => entry.name === name);
      if (found)
        return true;
    }
    catch (err) {
      let sterr = this.StorageError(err);
      logger.warn(sterr);
      throw sterr;
    }

    return false;
  }

  /**
   * Remove schema, i.e. file(s), on the filesystem.
   * Depending upon the filesystem may be a delete, mark for deletion, erase, etc.
   * @param {*} options Specify any options use when querying the filesystem.
   * @param {*} options.schema Override smt.schema with a filename in the same locus.
   * @returns StorageResults object with status.
   */
  async dull(schema) {
    logger.debug("StorageFileSystem dull");
    throw new StorageError(501);

    // return new StorageResults(0);
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
    //let schema = options?.schema ||  this.smt.schema;
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
    logger.debug("StorageFileSystem createWriteStream");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options?.schema ||  this.smt.schema;
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
   * @param {boolean} options.use_rpath If true replicate folder structure of remote filesystem in local filesystem.
   * @returns StorageResults object with status;
   */
  async getFile(options) {
    logger.debug("StorageFileSystem getFile");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options?.schema ||  this.smt.schema;
    //let result = false;

    //return new StorageResults(0);
  }

  /**
   * Upload a local file to the remote filesystem.
   * @param {object} options Specify a directory entry with any option properties used when querying the filesystem.
   * @param {SMT} options.smt smt.locus specifies the source folder in the local filesystem.
   * @param {object} options.entry Directory entry object containing the file information.
   * @param {boolean} options.use_rpath If true replicate folder structure of local filesystem in remote filesystem.
   * @returns StorageResults object with status.
   */
  async putFile(options) {
    logger.debug("StorageFileSystem putFile");
    throw new StorageError(501);

    //options = Object.assign({}, this.options, options);
    //let schema = options?.schema ||  this.smt.schema;
    //let result = false;

    //return new StorageResults(0);
  }

  /**
 * Convert an underlying filesystem error into a StorageError
 *
 * @param {*} err a filesystem error object
 * @returns a new StorageError object
 */
  StorageError(err) {
    if (err instanceof StorageError)
      return err;

    let status = ('status' in err) ? err.status : 500;

    // derived classes should override method
    // and implement error conversion logic

    return new StorageError(status, { cause: err });
  }

};

module.exports = exports = StorageFileSystem;

StorageFileSystem.fileSystemModels = [ "file", "ftp", "http", "https", "stream", "zip" ];
