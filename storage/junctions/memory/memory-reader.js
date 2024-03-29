// storage/junctions/memory-reader
"use strict";

const { StorageReader } = require('../storage-junction');
const { logger } = require('../../utils');

module.exports = exports = class MemoryReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);
  }

  async _construct(callback) {
    logger.debug("MemoryReader._construct");

    try {
      // open output stream

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('MemoryReader construct error'));
    }
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('Memory _read');
    // read up to size constructs

    try {
      // filter constructs using pattern
      // this.pattern

      for (let construct of this.junction._constructs.values()) {
        this.push(construct);
      }
    }
    catch (err) {
      logger.warn("memory reader: " + err.message);
      this.destroy(err);
    }

    // when done reading from source
    this.push(null);
  }

};
