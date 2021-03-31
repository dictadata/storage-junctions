/**
 * mssql/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const logger = require('../../logger');
const sqlEncoder = require("./mssql-encoder-sql");
const tedious = require('tedious');


module.exports = exports = class MSSQLReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.started = false;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('MSSQLReader._read');

    // read up to size constructs
    if (!this.started) {
      this.started = true;
    
      try {
        let sql = sqlEncoder.sqlSelectByPattern(this.engram, this.options);
        let request = new tedious.Request(sql, (err, rowCount) => {
          // when done reading from source
          this.push(null);
          if (err) {
            logger.error(err);
          } else {
            logger.debug(rowCount + ' rows');
          }
        });

        let engram = this.engram;
        request.on('row', (columns) => {
          this.push(sqlEncoder.decodeResults(engram, columns));
        });

        this.junction.connection.execSql(request);
      }
      catch (err) {
        logger.error(err);
        this.push(null);
      }
    }
  }

};
