/**
 * postgresql/reader
 */
"use strict";

const StorageReader = require('../storage-junction/reader');
const logger = require('../logger');

const pg = require('pg');
const util = require('util');

module.exports = exports = class PostgreSQLReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('postgresql _read');

    // read up to size constructs
    try {
      let results = await this.junction.pool.query('SELECT * FROM ' + this.engram.smt.schema + ';');

      for (let i = 0; i < results.length; i++)
        this.push(results[i]);

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      logger.error(err);
      this.push(null);
    }

  }

};