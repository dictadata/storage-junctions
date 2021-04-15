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

    // set capabilities of the StorageReader
    this.useTransforms = true;  // the data source doesn't support queries, so use the base junction will use Transforms to filter and select
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('Memory _read');
    // read up to size constructs

    try {
      // filter constructs using patttern
      let pattern = this.options.pattern || {};

      for (let construct of this.junction._constructs.values()) {
        this.push(construct);
      }
    }
    catch (err) {
      logger.error(err);
      throw err;
    }

    // when done reading from source
    this.push(null);
  }

};
