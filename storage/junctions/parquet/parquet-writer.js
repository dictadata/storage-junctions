"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const { logger } = require('../../utils');

const path = require('path');


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
        let stfs = await this.junction.getFileSystem();
        this.ws = await stfs.createWriteStream(this.options);
        this.ws.on('error',
          (err) => {
            this.destroy(err);
          });

        // write opening, if any
        await this.ws.write(this.open);
      }

      let data = (this._statistics.count === 0) ? "" : this.delim;

      data += JSON.stringify(construct);
      if (data.length > 0) {
        this._count(1);
        await this.ws.write(data);
      }

      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new StorageError(500, 'ParquetWriter write error').inner(err));
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
      logger.warn(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
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
        // write footer line
        await this.ws.end(this.close);

        if (this.ws.fs_ws_promise)
          await this.ws.fs_ws_promise;
        else
          await new Promise((fulfill) => this.ws.on("finish", fulfill));
      }
      this._count(null);
      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new StorageError(500, 'Error _final').inner(err));
    }
  }

};
