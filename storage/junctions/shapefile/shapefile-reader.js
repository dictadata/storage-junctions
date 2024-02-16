"use strict";

const { StorageReader } = require('../storage-junction');
const { StorageError } = require("../../types");
const { logger } = require('../../utils');

const shapefile = require('shapefile');

module.exports = exports = class ShapeFileReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.schemafile = this.options?.schema || options?.name || this.smt.schema;

    this.done = false;
    this.source = null;
    this.bbox = null;
  }

  async _construct(callback) {
    logger.debug("ShapeFileReader._construct");

    try {
      // start the reader
      logger.debug('ShapeFileReader start');
      this.stfs = await this.junction.getFileSystem();

      if (! await this.stfs.exists({ schema: this.schemafile + '.shp' }))
        throw new StorageError(404);

      this.shp = await this.stfs.createReadStream({ schema: this.schemafile + '.shp' });
      this.dbf = await this.stfs.createReadStream({ schema: this.schemafile + '.dbf' });

      this.shp.on('error',
        (err) => {
          logger.warn("ShapeFileReader .shp stream error: " + err.message);
        }
      );
      this.dbf.on('error',
        (err) => {
          logger.warn("ShapeFileReader .dbf stream error: " + err.message);
        }
      );

      this.source = await shapefile.open(this.shp, this.dbf);
      this.bbox = this.source.bbox;

      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(this.stfs?.Error(err) || new Error('ShapeFileReader construct error'));
    }
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('ShapeFileReader _read');

    try {
      if (!this.done) {
        logger.debug('ShapeFileReader source.read');
        let record = await this.source.read();
        if (record.value)
          this.push(record.value);  // geoJSON feature
        if (record.done) {
          this.done = true;
          this.push(null);
        }
      }
    }
    catch (err) {
      logger.warn(`ShapeFileReader read error: ${err.message}`);
      this.destroy(this.stfs?.Error(err) ?? err);
    }
  }

};
