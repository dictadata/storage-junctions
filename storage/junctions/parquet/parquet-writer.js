"use strict";

const Storage = require('../../storage');
const { StorageWriter } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const path = require('node:path');


module.exports = exports = class ParquetWriter extends StorageWriter {

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

    this.ws = null;
  }

  async _construct(callback) {
    logger.debug("ParquetWriter._construct");

    try {
      // open output stream

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('ParquetWriter construct error'));
    }
  }

  async _destroy(err, callback) {
    callback();
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("ParquetWriter._write");
    //logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema

      // check if file is open
      if (this.ws === null) {
        this.stfs = await this.junction.getFileSystem();
        this.ws = await this.stfs.createWriteStream(this.options);
        this.ws.on('error',
          (err) => {
            this.destroy(err);
          });

        // write opening, if any
        this.ws.write(this.open);
      }

      let data = (this._stats.count === 0) ? "" : this.delim;

      data += JSON.stringify(construct);
      if (data.length > 0) {
        this._stats.count += 1;
        this.ws.write(data);
      }

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError(500, 'ParquetWriter write error', { cause: err }));
    }

  }

  /**
   *
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("ParquetWriter._writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[ i ].chunk;
        let encoding = chunks[ i ].encoding;

        // save construct to schema
        await this._write(construct, encoding, () => { });
      }
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError(500, 'Error storing construct', { cause: err }));
    }
  }

  /**
   *  close connection, cleanup resources, ...
   * @param {*} callback
   */
  async _final(callback) {
    logger.debug("ParquetWriter._final");

    try {
      if (this.ws) {
        if (this.autoClose) {
          // write footer line
          await new Promise((resolve) => {
            this.ws.end(this.close, resolve);
          });
        }
      }
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError(500, 'Error _final', { cause: err }));
    }
  }

};
