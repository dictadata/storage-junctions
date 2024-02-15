"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const { logger } = require('../../utils');

module.exports = exports = class EchoWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }

  async _write(construct, encoding, callback) {
    logger.debug("EchoWriter._write");
    //logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }
    try {
      // save construct to .schema
      this._count(1);
      logger.info(JSON.stringify(construct));
    }
    catch (err) {
      logger.warn(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }

    callback();
  }

  async _writev(chunks, callback) {
    logger.debug("EchoWriter._writev");

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
      logger.warn(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

  async _final(callback) {
    logger.debug("EchoWriter._final");

    try {
      // close connection, cleanup resources, ...
      this._count(null);
      callback();
    }
    catch (err) {
      logger.warn(err);
      callback(new StorageError(500, 'Error writer._final').inner(err));
    }
  }

};
