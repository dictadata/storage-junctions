"use strict";

const StorageReader = require('../junction/reader');

module.exports = class EchoReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  _read(size) {
    console.log('EchoReader _read');
    let ok = true;

    // retrieve or open data source
    let results = [{field1: "test",field2:1}];

    // keep pushing while more == true
    for (let i = 0; i < results.length; i++) {
      if (i >= size)
        break;

      let construct = results[i];
      if (!this.push(construct))
        break;
    }

    if (!ok) {
      process.nextTick(() => this.emit('error', new Error('error reading')));
      return;
    }

    // when done reading from source
    this.push(null);
  }

};
