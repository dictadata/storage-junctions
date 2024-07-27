/**
 * rest/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { contentTypeIsJSON, replace, logger } = require('@dictadata/lib');

module.exports = exports = class RESTReader extends StorageReader {

  /**
   *
   * @param {Object} storageJunction
   * @param {Object}   options
   * @param {boolean}  options.addHeader input includes a header row, default false
   * @param {string[]} options.headers values to use for field names, default undefined
   * @param {boolean}  options.raw output raw data arrays
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.encoder = this.junction.createEncoder(options);
    this.results;

    if (!options.raw && !options.headers && options.encoding)
      this.options.headers = this.engram.names;

  }

  async _construct(callback) {
    logger.debug("RESTReader._construct");

    try {
      let baseURL = this.smt.locus;
      let url = this.options.url || this.engram.smt.schema || '';
      let urlReplace = this.options.urlReplace;
      if (urlReplace) {
        baseURL = replace(baseURL, urlReplace);
        url = replace(url, urlReplace);
      }

      let request = Object.assign({
        method: "GET",
        base: baseURL,
        headers: {
          'Accept': 'application/json',
          'User-Agent': '@dictadata.net/storage'
        },
        timeout: 10000
      }, this.options.http || {});

      let data = this.options.data;

      if (this.options) {
        let params = this.options.params || this.options.match || {};
        if (request.method === "GET")
          request.params = params;  // querystring
        else
          data = params;
      }

      let response = await this.junction.httpRequest(url, request, data);

      if (response.statusCode !== 200) {
        let msg = typeof response.data === "string" ? response.data : null;
        this.destroy(new StorageError(response.statusCode, msg));
      }

      if (contentTypeIsJSON(response.headers[ "content-type" ]))
        this.results = JSON.parse(response.data);
      else
        this.results = response.data;

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('RESTReader construct error'));
    }
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('REST _read');
    // read up to size constructs

    try {
      // push results to stream
      this.encoder.parseData(this.results, this.options, (construct) => {
        construct = this.encoder.cast(construct);
        construct = this.encoder.filter(construct);
        construct = this.encoder.select(construct);
        if (construct)
          this._stats.count += 1;
          this.push(construct);
      });

    }
    catch (err) {
      logger.warn(err.message);
      logger.warn("RESTReader: " + err.message);
      this.destroy(err);
    }

    // when done reading from source
    this.push(null);
  }

};
