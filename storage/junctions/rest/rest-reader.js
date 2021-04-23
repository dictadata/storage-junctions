/**
 * rest/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { logger, httpRequest } = require('../../utils');
const encoder = require('./rest-encoder');
const { StorageError } = require('../../types');

module.exports = exports = class RESTReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
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
      let url = this.options.url || this.engram.smt.schema || '';

      let request = {
        method: this.options.method || 'GET',
        base: this.options.base || this.smt.locus,
        headers: Object.assign({ 'Accept': 'application/json', 'User-Agent': '@dictadata.org/storage' }, this.options.headers),
        timeout: this.options.timeout || 10000
      };
      if (this.options.auth)
        request["auth"] = this.options.auth;
      if (this.options.query)
        request["query"] = this.options.query;  // a pattern will override query
            
      let data = this.options.data;  // a pattern will override data
      if (this.options.pattern) {
        // pattern will override options.data
        let match = this.options.pattern.match || this.options.pattern;
        if (request.method === "GET")
          request.query = match  // querystring
        else
          data = match;
      }

      let response = await httpRequest(url, request, data);
      if (response.statusCode !== 200) {
        let msg = typeof response.data === "string" ? response.data : null;
        throw new StorageError(response.statusCode, msg);
      }

      let results;
      if (httpRequest.contentTypeIsJSON(response.headers["content-type"]))
        results = JSON.parse(response.data);
      else
        results = response.data;

      encoder.parseData(results, this.options, (construct) => {
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
