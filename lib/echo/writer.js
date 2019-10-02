"use strict";

const StorageWriter = require('../junction/writer');
const {StorageError} = require("../types");
const logger = require('../logger');

module.exports = class EchoWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
    super(storageJunction, options);

  }

  _write(construct, encoding, callback) {
    logger.debug("EchoWriter _write");

    try {
      // save construct to .schema
      logger.debug(construct);
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }

    callback();
  }

  _writev(chunks, callback) {
    logger.debug("EchoWriter _writev");

    for (var i = 0; i < chunks.length; i++) {
      let construct = chunks[i].chunk;
      let encoding = chunks[i].encoding;

      try {
        // save construct to .schema
        logger.debug(construct);
        logger.debug(encoding);
      }
      catch(err) {
        this._logger.error(err.message);
        callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
      }
    }

    callback();
  }

  _final(callback) {
    logger.debug("EchoWriter _final");

    try {
      // close connection, cleanup resources, ...
    }
    catch(err) {
      this._logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }
    callback();
  }

};
