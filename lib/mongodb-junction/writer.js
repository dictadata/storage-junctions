"use strict";

const StorageWriter = require('../storage-junction/writer');
//const MongoDB = require('mongodb');
const { StorageError } = require("../types");
const logger = require('../logger');

module.exports = exports = class MongoDBWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }



  async _write(construct, encoding, callback) {
    logger.debug("_write");

    try {
      // save construct to .schema
      logger.debug(JSON.stringify(construct));
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }

    callback();
  }

  async _writev(chunks, callback) {
    for (var i = 0; i < chunks.length; i++) {
      let construct = chunks[i].chunk;
      //let encoding = chunks[i].encoding;

      try {
        // save construct to .schema
        logger.debug(JSON.stringify(construct));
      }
      catch (err) {
        logger.error(err);
        callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
      }
    }

    callback();
  }

  async _final(callback) {

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