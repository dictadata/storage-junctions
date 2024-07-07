/**
 * mysql/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { logger } = require('@dictadata/lib');
const sqlEncoder = require('./mysql-encoder-sql');


module.exports = exports = class MySQLReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.rows;
  }

  async _construct(callback) {
    logger.debug("MySQLReader._construct");

    try {
      // open output stream
      const pattern = this.options.pattern || this.options || {};
      let sql = sqlEncoder.sqlSelectByPattern(this.engram, pattern);
      this.rows = await this.junction.pool.query(sql);

      callback();
    }
    catch (err) {
      logger.warn("MySQLReader: " + (err.code || err.message));
      callback(this.stfs?.StorageError(err) || new StorageError('MySQLReader construct error'));
    }
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('MySQLReader _read');

    // read up to size constructs
    try {
      for (let i = 0; i < this.rows.length; i++) {
        let construct = this.rows[ i ];
        sqlEncoder.decodeResults(this.engram, construct);
        this._stats.count += 1;
        this.push(construct);
      }

      // when done reading from source
      this.push(null);
    }
    catch (err) {
      logger.warn("MySQLReader: " + (err.code || err.message));
      this.destroy(err);
    }

  }

};
