/**
 * transport/reader
 */
"use strict";

const { StorageReader } = require('../storage');
const encoder = require('./transport-encoder');
const Axios = require("axios");
const logger = require('../../logger');

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
      let axiosOptions = {
        baseURL: this.engram.smt.locus,
        headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
        auth: this.options.auth || {},
        params: this.options.params || {},
        timeout: this.options.timeout || 10000
      };

      let url = this.options.url || this.engram.smt.schema || '/';
      let response = await Axios.get(url, axiosOptions);

      encoder.parseData(response.data, this.options, (construct) => {
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