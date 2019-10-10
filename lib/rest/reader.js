"use strict";

const StorageReader = require('../junction/reader');
const encoder = require('./encoder');
const Axios = require("axios");
const logger = require('../logger');

module.exports = class RestReader extends StorageReader {

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
        baseURL: this._engram.smt.locus,
        headers: Object.assign({'Accept': 'application/json', 'User-Agent': '@dicta.io/storage-node'}, this._options.headers),
        auth: this._options.auth || {},
        params: this._options.params || {},
        timeout: this._options.timeout || 10000
      };

      let url = this._options.url || this._engram.smt.schema || '/';
      let response = await Axios.get(url, axiosOptions);

      encoder.parseData(response.data, this._options, construct => {
        this.push(construct);
      });

    }
    catch(err) {
      logger.debug(err);
      this._logger.error(err.message);
    }

    // when done reading from source
    this.push(null);
  }

};
