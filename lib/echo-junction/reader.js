"use strict";

const StorageReader = require('../storage-junction/reader');
const { StorageError } = require("../types");
const logger = require('../logger');

module.exports = exports = class EchoReader extends StorageReader {

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
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  _read(size) {
    logger.verbose('EchoReader _read');
    let ok = true;

    // retrieve or open data source
    let results = [{ field1: "test", field2: 1 }];

    // keep pushing while more == true
    for (let i = 0; i < results.length; i++) {
      if (i >= size)
        break;

      let construct = results[i];
      if (!this.push(construct))
        break;
    }

    if (!ok) {
      process.nextTick(() => this.emit('error', new StorageError({ statusCode: 500 }, 'error reading')));
      return;
    }

    // when done reading from source
    this.push(null);
  }

};
