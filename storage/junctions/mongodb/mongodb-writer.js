"use strict";

const { StorageWriter } = require('../storage-junction');
const { StorageError } = require("../../types");
const logger = require('../../logger');

//const MongoDB = require('mongodb');

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
    logger.debug("MongoDBWriter._write");
    logger.debug(JSON.stringify(construct));    
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      this._count(1);
      logger.debug(JSON.stringify(construct));
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }

    callback();
  }

  async _writev(chunks, callback) {
    logger.debug("MongoDbWriter._writev");

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
      logger.error(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

  async _final(callback) {
    logger.debug("MongoDbWriter._final");

    try {
      // close connection, cleanup resources, ...
      this._count(null);
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError(500, 'Error writer._final').inner(err));
    }
  }

};
