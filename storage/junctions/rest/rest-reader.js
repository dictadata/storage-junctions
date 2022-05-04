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

      let req_options = Object.assign({
        method: "GET",
        base: this.smt.locus,
        headers: {
          'Accept': 'application/json',
          'User-Agent': '@dictadata.org/storage'
        },
        timeout: 10000
      }, this.options.http || {});
      // note, a pattern will override req_options["query"]

      let data = this.options.data;  // a pattern will override data
      if (this.options.pattern) {
        // pattern will override options.data
        let match = this.options.pattern.match || this.options.pattern;
        if (req_options.method === "GET")
          req_options.query = match;  // querystring
        else
          data = match;
      }

      let results;
      let response = await httpRequest(url, req_options, data);

      if (response.statusCode !== 200) {
        let msg = typeof response.data === "string" ? response.data : null;
        this.destroy(new StorageError(response.statusCode, msg));
      }

      if (httpRequest.contentTypeIsJSON(response.headers[ "content-type" ]))
        results = JSON.parse(response.data);
      else
        results = response.data;

      // push results to stream
      encoder.parseData(results, this.options, (construct) => {
        this.push(construct);
      });

    }
    catch (err) {
      logger.debug(err);
      logger.error("rest reader: " + err.message);
      this.destroy(err);
    }

    // when done reading from source
    this.push(null);
  }

};
