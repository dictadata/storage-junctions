"use strict";

const StorageReader = require('../storage-junction/reader');

module.exports = exports = class MongoDBReader extends StorageReader {

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
  _read(size) {

    // read up to size constructs

    // when done reading from source
    this.push(null);
  }

};
