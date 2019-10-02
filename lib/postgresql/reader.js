/**
 * postgresql/reader
 */
"use strict";

const StorageReader = require('../junction/reader');
const logger = require('../logger');

const pg = require('pg');
const util = require('util');

module.exports = class PostgreSQLReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options = null) {
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
      let results = await this._junction.pool.query('SELECT * FROM ' + this._engram.schema + ';');

      for (let i = 0; i < results.length; i++)
        this.push(results[i]);

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      this._logger.error(err.message);
      this.push(null);
    }

  }

};
