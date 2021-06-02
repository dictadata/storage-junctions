"use strict";

const { StorageReader } = require('../storage-junction');
const { logger } = require('../../utils');

const path = require('path');
const shapefile = require('shapefile');

module.exports = exports = class ShapeFileReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.filename = this.options.schema || this.smt.schema;

    this.started = false;
    this.done = false;
    this.source = null;
    this.bbox = null;
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('ShapeFileReader _read');
    let cnt = 0;

    if (!this.started) {
      // start the reader
      logger.debug('ShapeFileReader start');
      this.stfs = await this.junction.getFileSystem();
      this.shp = await this.stfs.createReadStream({ schema: this.filename + '.shp' });
      this.dbf = await this.stfs.createReadStream({ schema: this.filename + '.dbf' });

      this.started = true;
      this.source = await shapefile.open(this.shp, this.dbf);
      this.bbox = this.source.bbox;
    }

    while (!this.done) {
      logger.debug('ShapeFileReader source.read');
      let record = await this.source.read();
      if (record.value)
        this.push(record.value);  // geoJSON feature
      if (record.done) {
        this.done = true;
        this.push(null);
      }

      if (++cnt >= _size)
        logger.debug('ShapeFileReader break');
        break;
    }
  }

};
