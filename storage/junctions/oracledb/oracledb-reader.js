/**
 * oracledb/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const logger = require('../../logger');
const sqlEncoder = require("./oracledb-sql-encoder");

module.exports = exports = class OracleDBReader extends StorageReader {

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
    logger.debug('OracleDBReader._read');

    // read up to size constructs
    if (!this.started) {
      this.started = true;
    
      let connection;
      try {
        let sql = sqlEncoder.sqlSelectWithPattern(this.engram, this.options);
        connection = await this.junction.pool.getConnection();
        let qstream = await connection.queryStream(sql, [],  // no binds 
          {
            prefetchRows: 150,  // internal buffer sizes can be adjusted for performance tuning
            fetchArraySize: 150
          });

        let reader = this;
        const consumeStream = new Promise((resolve, reject) => {
          let rowcount = 0;

          qstream.on('metadata', function (metadata) {
            // access metadata of query
          });

          qstream.on('data', function (data) {
            // handle data row...
            sqlEncoder.decodeResults(reader.engram, data);
            reader.push(data);
            rowcount++;
          });

          qstream.on('end', function () {
            // all data has been fetched...
            reader.push(null);
            qstream.destroy();  // the stream should be closed when it has been finished
          });

          qstream.on('close', function () {
            // can now close connection...  (Note: do not close connections on 'end')
            //connection.close();
            resolve(rowcount);
          });

          qstream.on('error', function (error) {
            // handle any error...
            reject(error);
          });
        });

        const numrows = await consumeStream;
        logger.verbose('Rows read: ' + numrows);
      }

      catch (err) {
        logger.error(err);
        this.push(null);
      }
      finally {
        /*
        if (connection) {
          try {
            await connection.close();
          } catch (err) {
            logger.error(err);
          }
        }
        */
      }
    }
  }
};
