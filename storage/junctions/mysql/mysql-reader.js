/**
 * mysql/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { logger } = require('../../utils');
const sqlEncoder = require("./mysql-encoder-sql");


module.exports = exports = class MySQLReader extends StorageReader {

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
    logger.debug('mysql _read');

    // read up to size constructs
    try {
      let pattern = this.options.pattern || {};
      let sql = sqlEncoder.sqlSelectByPattern(this.engram, pattern);
      let rows = await this.junction.pool.query(sql);

      for (let i = 0; i < rows.length; i++) {
        let construct = rows[ i ];
        sqlEncoder.decodeResults(this.engram, construct);
        this.push(construct);
      }

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      logger.error("mysql reader: " + err.message);
      this._destroy(err);
    }

  }

};
