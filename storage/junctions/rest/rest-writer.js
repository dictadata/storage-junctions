"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

module.exports = exports = class RESTWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }

  async _construct(callback) {
    logger.debug("RESTWriter._construct");

    try {
      // open output stream

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('RESTWriter construct error'));
    }
  }

  async _write(construct, encoding, callback) {
    logger.debug("RESTWriter._write");
    //logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      this._count(1);
      //logger.debug(JSON.stringify(construct));
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError(500, 'RESTWriter Error storing construct', { cause: err }));
    }

    callback();
  }

  async _writev(chunks, callback) {
    logger.debug("RESTWriter._writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to .schema
        await this._write(construct, encoding, () => {});
      }
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError(500, 'RESTWriter Error storing construct', { cause: err }));
    }
  }

  async _final(callback) {
    logger.debug("RESTWriter._final");

    try {
      // close connection, cleanup resources, ...
      this._count(null);
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError(500, 'RESTWriter Error writer._final', { cause: err }));
    }
  }

};
