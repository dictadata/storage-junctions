/**
 * postgresql/writer
 */
"use strict";

const StorageWriter = require('../junction/writer');
const encoder = require('./encoder');
const {StorageError} = require("../types");
const logger = require('../logger');

const pg = require('pg');
const util = require('util');

module.exports = exports = class PostgreSQLWriter extends StorageWriter {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }

  async _write(construct, encoding, callback) {
    logger.debug("postgresql _write");
    logger.debug(JSON.stringify(construct));

    try {
      // save construct to .schema
      await this.junction.store(construct);

      callback();
    }
    catch (err) {
      logger.error(err.message);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("PostgreSQLWriter _writev");

    try {
      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        //let encoding = chunks[i].encoding;  // string encoding

        // save construct to .schema
        await this.junction.store(construct);
      }
      callback();
    }
    catch (err) {
      logger.error(err.message);
      callback(err);
    }
  }

  _final(callback) {

    try {
      // close connection, cleanup resources, ...
    }
    catch(err) {
      logger.error(err.message);
      callback(new StorageError({statusCode: 500, _error: err}, 'Error storing construct'));
    }
    callback();
  }

};
