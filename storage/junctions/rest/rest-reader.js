/**
 * rest/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const encoder = require('./rest-encoder');
const httpRequest = require('../../utils/httpRequest');
const logger = require('../../logger');

module.exports = exports = class RESTReader extends StorageReader {

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
    logger.debug('REST _read');
    // read up to size constructs

    try {
      let url = this.options.url || this.engram.smt.schema || '';
      //if (pattern) {
        // querystring parameters
        // url += ???
      //}

      let request = {
        method: 'GET',
        origin: this.options.origin || this.smt.locus,
        headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
        timeout: this.options.timeout || 10000
      };
      if (this.options.auth)
        request["auth"] = this.options.auth;

      let response = await httpRequest(url, request);

      let data;
      if (encoder.isContentJSON(response.headers["content-type"]))
        data = JSON.parse(response.data);
      else
        data = response.data;

      encoder.parseData(data, this.options, (construct) => {
        this.push(construct);
      });

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
