/**
 * storage/filesystems/stream-filesystem
 *
 * a pass through filesystem for things like HTTP requests and response
 */
"use strict";

const StorageFileSystem = require("./storage-filesystem");
const { SMT, StorageError } = require("../types");
const { logger } = require("../utils");

const path = require('node:path');

module.exports = exports = class StreamFileSystem extends StorageFileSystem {

  /**
   * construct a StreamFileSystem object
   * @param {*} smt storage memory trace
   * @param {*} options stream filesystem options
   * @param {*} options.reader readable stream
   * @param {*} options.writer writable stream
   */
  constructor(smt, options) {
    super(smt, options);
    logger.debug("StreamFileSystem");
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
   * Create an object mode readstream from the filesystem file.
   * @param {*} options stream filesystem options.
   * @param {*} options.reader readable stream
  */
  async createReadStream(options) {
    logger.debug("StreamFileSystem createReadStream");

    if (options.reader || this.options.reader)
      return options.reader || this.options.reader;
    else
      throw new StorageError(500, "reader not assigned");
  }

  /**
   * Create an object mode writestream to the filesystem file.
   * @param {*} options stream filesystem options.
   * @param {*} options.writer writable stream
  */
  async createWriteStream(options) {
    logger.debug("StreamFileSystem createWriteStream");

    if (options.writer || this.options.writer)
      return options.writer || this.options.writer;
    else
      throw new StorageError(500, "writer not assigned");
  }

  /**
   * Convert a stream error into a StorageResponse
   *
   * @param {*} err a stream error object
   * @returns a new StorageError object
   */
  Error(err) {
    if (err instanceof StorageError)
      return err;

    let status = ('status' in err) ? err.status : 500;

    // derived classes should override method
    // and implement error conversion logic

    return new StorageError(status).inner(err);
  }

};
