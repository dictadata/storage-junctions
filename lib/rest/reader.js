/**
 * rest/reader
 */
"use strict";

const StorageReader = require('../junction/reader');
const encoder = require('./encoder');
const Axios = require("axios");
const logger = require('../logger');

module.exports = exports = class RestReader extends StorageReader {

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
    logger.debug('REST _read');
    // read up to size constructs

    try {
      let axiosOptions = {
        baseURL: this.engram.smt.locus,
        headers: Object.assign({'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage-node'}, this.junction._options.headers),
        auth: this.junction._options.auth || {},
        params: this.junction._options.params || {},
        timeout: this.junction._options.timeout || 10000
      };

      let url = this.junction._options.url || this.engram.smt.schema || '/';
      let response = await Axios.get(url, axiosOptions);

      encoder.parseData(response.data, this.options, (construct) => {
        this.push(construct);
      });

    }
    catch(err) {
      logger.debug(err);
      this.logger.error(err.message);
      throw err;
    }

    // when done reading from source
    this.push(null);
  }

};
