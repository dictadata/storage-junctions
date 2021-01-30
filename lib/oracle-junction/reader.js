/**
 * oracle/reader
 */
"use strict";

const StorageReader = require('../storage-junction/reader');
const logger = require('../logger');
const sqlEncoder = require("./encoder_sql");

const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

module.exports = exports = class OracleReader extends StorageReader {

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
    logger.debug('OracleReader._read');

    // read up to size constructs
    if (!this.started) {
      this.started = true;
    
      let engram = this.engram;
      let connection;
      try {
        let sql = sqlEncoder.sqlSelectWithPattern(this.engram, this.options);
        connection = await this.pool.getConnection();
        let qstream = await connection.queryStream(sql);

        qstream.on('metadata', function (metadata) {
          // access metadata of query
        });

        qstream.on('data', function (data) {
          // handle data row...
          //this.push(sqlEncoder.decodeResults(engram, columns));
          this.push(data);
        });

        qstream.on('end', function () {
          // all data has been fetched...
          this.push(null);
          qstream.destroy();  // the stream should be closed when it has been finished
        });

        qstream.on('close', function () {
          // can now close connection...  (Note: do not close connections on 'end')
          connection.close();
        });

        qstream.on('error', function (error) {
          // handle any error...
          throw error;
        });
      }
      catch (err) {
        logger.error(err);
        this.push(null);
      }
    }
  }

};
