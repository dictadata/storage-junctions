/**
 * postgresql/writer
 */
"use strict";

const StorageWriter = require('../storage-junction/writer');
const encoder = require('./encoder');
const { StorageError } = require("../types");
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
    logger.debug("PostgreSQLWriter._write");
    logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      // save construct to .schema
      this._count(1);
      await this.junction.store(construct);

      callback();
    }
    catch (err) {
      logger.error(err);
      callback(err);
    }

  }

  async _writev(chunks, callback) {
    logger.debug("PostgreSQLWriter._writev");

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
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }
  }

  async _final(callback) {
    logger.debug("PostgreSQLWriter._final");

    try {
      // close connection, cleanup resources, ...
      this._count(null);
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError({ statusCode: 500, _error: err }, 'Error storing construct'));
    }
  }

};
