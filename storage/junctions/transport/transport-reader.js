/**
 * transport/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const encoder = require("../oracledb/oracledb-encoder");
const sqlEncoder = require("../oracledb/oracledb-sql-encoder");
const logger = require('../../logger');

const httpRequest = require("../../utils/httpRequest");

module.exports = exports = class TransportReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // set capabilities of the StorageReader
    this.useTransforms = true;  // the data source doesn't support queries, so use the base junction will use Transforms to filter and select
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('Transport _read');
    // read up to size constructs

    try {
      let pattern = this.options.pattern || {};

      let request = {
        model: 'oracledb',
        method: 'retrieve',
        sql: sqlEncoder.sqlSelectByPattern(this.engram, pattern)
      }
      logger.debug(request.sql);

      let res = await httpRequest(this.junction.url, this.junction.reqOptions, JSON.stringify(request));
      let response = JSON.parse(res.data);
      
      let rows = response.data;
      for (let i = 0; i < rows.length; i++) {
        sqlEncoder.decodeResults(this.engram, rows[i]);
        this.push(rows[i]);
      }

    }
    catch (err) {
      logger.debug(err);
      logger.error(err);
      throw err;
    }

    // when done reading from source
    this.push(null);
  }

};
