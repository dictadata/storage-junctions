"use strict";

const StorageReader = require('../storage-junction/reader');
const logger = require('../logger');

const path = require('path');

// import shapefiles reader

module.exports = exports = class ShapesReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    if (this.options.schema && path.extname() === '')
      this.options.schema = this.options.schema + '.shp';

    // set capabilities of the StorageReader
    this.useTransforms = true;  // the data source doesn't support queries, so use the base junction will use Transforms to filter and select

    /***** create the parser and data handlers *****/
    var reader = this;
    var encoding = this.engram;

    let parser = null;

    var count = 0;
    var max = this.options.max_read || -1;

    reader.push(null);

    this.started = false;
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('ShapesReader _read');

    if (!this.started) {
      // start the reader
      let stfs = await this.junction.getFileSystem();
      var rs = await stfs.createReadStream(this.options);
      rs.pipe(this.parser);
      this.started = true;
    }
    else if (this.parser.isPaused()) {
      // resume reading
      this.parser.resume();
    }
    else if (this.parser.destroyed || !this.parser.readable)
      this.push(null);
  }

};
