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
      logger.error("memory reader: " + err.message);
      this._destroy(err);
    }

    // when done reading from source
    this.push(null);
  }

};
