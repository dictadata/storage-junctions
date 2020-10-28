"use strict";

const StorageWriter = require('../storage-junction/writer');
const { StorageError } = require("../types");
const logger = require('../logger');

module.exports = exports = class EchoWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }

  _write(construct, encoding, callback) {
    logger.verbose("EchoWriter _write");

    try {
      // save construct to .schema
      logger.info(JSON.stringify(construct));
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }

    callback();
  }

  _writev(chunks, callback) {
    logger.verbose("EchoWriter _writev");

    for (var i = 0; i < chunks.length; i++) {
      let construct = chunks[i].chunk;
      let encoding = chunks[i].encoding;

      try {
        // save construct to .schema
        logger.info(JSON.stringify(construct));
        logger.debug(encoding);
      }
      catch (err) {
        logger.error(err);
        callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
      }
    }

    callback();
  }

  _final(callback) {
    logger.debug("EchoWriter _final");

    try {
      // close connection, cleanup resources, ...
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }
    callback();
  }

};
