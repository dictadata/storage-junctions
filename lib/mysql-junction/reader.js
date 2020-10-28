/**
 * mysql/reader
 */
"use strict";

const StorageReader = require('../storage-junction/reader');
const logger = require('../logger');
const sqlEncoder = require("./sql_encoder");


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
      let sql = sqlEncoder.sqlSelectWithPattern(this.engram, this.options);
      let rows = await this.junction.pool.query(sql);

      for (let i = 0; i < rows.length; i++) {
        let construct = rows[i];
        sqlEncoder.validateResults(this.engram, construct);
        this.push(construct);
      }

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      logger.error(err);
      this.push(null);
    }

  }

};
