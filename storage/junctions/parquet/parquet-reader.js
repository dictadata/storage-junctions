/**
 * storage/junctions/parquet/parquet-reader.js
 *
 * This module has NOT been implemented, yet.
 *
 */
"use strict";

const Storage = require('../../storage');
const { StorageReader } = require('../storage-junction');
const { logger } = require('@dictadata/lib');

const path = require('node:path');


module.exports = exports = class ParquetReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // check schema's extension
    if (path.extname(this.options?.schema) === '')
      this.options.schema = this.options.schema + '.parquet';

    var reader = this;
    var encoding = this.engram;
    var encoder = this.junction.createEncoder(options);

    /***** create the parser *****/

    let parser = null;
    if (this.engram.smt.model === 'Parquets' || this.engram.smt.model === 'Parquetl')
      parser = this.parser = StreamValues.withParser();
    else if (this.engram.smt.model === 'Parqueto')
      parser = this.parser = StreamObject.withParser();
    else  // default Parquet array
      parser = this.parser = StreamArray.withParser();

    var _stats = this._stats;
    var count = this.options?.pattern?.count || this.options?.count || -1;

    // eslint-disable-next-line arrow-parens
    parser.on('data', async (data) => {
      if (data.value) {
        let construct = encoder.cast(data.value);
        construct = encoder.filter();
        construct = encoder.select(construct);
        //logger.debug(JSON.stringify(data.value));
        if (!construct)
          return;

        await this.output(construct);

        if (count > 0 && _stats.count >= count) {
          reader.push(null);
          pipeline.destroy();
        }
      }
    });

    parser.on('end', () => {
      reader.push(null);
    });

    parser.on('error', function (err) {
      logger.warn(err.message);
    });

    this.started = false;
  }

  /**
   * waiting on output helps with node micro-tasking
   * @param {*} construct
   */
  async output(construct) {

    this._stats.count += 1;
    if (!this.push(construct)) {
      this.parser.pause();  // If push() returns false then pause reading from source.
    }

    if (this._stats.count % 100000 === 0)
      logger.verbose(this._stats.count + " " + this._stats.interval + "ms");
  }

  async _construct(callback) {
    logger.debug("ParquetReader._construct");

    try {
      // open output stream

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('ParquetReader construct error'));
    }
  }

  async _destroy(err, callback) {
    callback();
  }

  /**
   * An internal call to fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(_size) {
    logger.debug('ParquetReader _read');

    if (!this.started) {
      // start the reader
      try {
        this.stfs = await this.junction.getFileSystem();
        var rs = await this.stfs.createReadStream(this.options);
        rs.setEncoding(this.options.fileEncoding || "utf8");
        rs.on('error',
          (err) => {
            this.destroy(err);
          }
        );
        rs.pipe(this.parser);
        this.started = true;
      }
      catch (err) {
        logger.debug("ParquetReader reader error: " + err.message);
        this.destroy(err);
      }
    }
    else if (this.parser.isPaused()) {
      // resume reading
      this.parser.resume();
    }
    else if (this.parser.destroyed || !this.parser.readable)
      this.push(null);
  }

};
