"use strict";

const { StorageWriter } = require('../storage-junction');
const { logger } = require('@dictadata/lib');

module.exports = exports = class NullWriter extends StorageWriter {

  /**
   *
   * @param {StorageJunction} junction - parent storage-junction
   * @param {object} options
   */
  constructor(junction, options) {
    super(junction, options);
  }

  /**
   *
   * @param {*} callback
   */
  async _construct(callback) {
    logger.debug("NullWriter._construct");

    try {
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError('NullWriter _construct error', { cause: err }));
    }
  }

  /**
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  async _write(construct, encoding, callback) {
    logger.debug("NullWriter._write");
    try {
      this._stats.count += 1;
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError('NullWriter _write error', { cause: err }));
    }
  }

  /**
   *
   * @param {*} chunks
   * @param {*} callback
   */
  async _writev(chunks, callback) {
    logger.debug("NullWriter._writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[ i ].chunk;
        let encoding = chunks[ i ].encoding;

        // save construct to schema
        await this._write(construct, encoding, () => {});
      }
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError("NullWriter _writev error", { cause: err }));
    }
  }

  /**
   *  close connection, cleanup resources, ...
   * @param {*} callback
   */
  async _final(callback) {
    logger.debug("NullWriter._final");
    try {

      logger.verbose(`NullWriter: ${this._stats.count} in ${this._stats.elapsed}ms`);

      callback();
    }
    catch (err) {
      // logger.warn(err.message);
      callback(new StorageError('Error _final', { cause: err }));
    }
  }

};
