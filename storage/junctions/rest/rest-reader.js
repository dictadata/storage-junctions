/**
 * rest/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { logger, httpRequest, templateReplace } = require('../../utils');
const { StorageError } = require('../../types');

module.exports = exports = class RESTReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.encoder = this.junction.createEncoder(options);
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('REST _read');
    // read up to size constructs

    try {
      let baseURL = this.smt.locus;
      let url = this.options.url || this.engram.smt.schema || '';
      let urlReplace = this.options.urlReplace;
      if (urlReplace) {
        baseURL = templateReplace(baseURL, urlReplace);
        url = templateReplace(url, urlReplace);
      }

      let request = Object.assign({
        method: "GET",
        base: baseURL,
        headers: {
          'Accept': 'application/json',
          'User-Agent': '@dictadata.org/storage'
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

      let results;
      let response = await httpRequest(url, request, data);

      if (response.statusCode !== 200) {
        let msg = typeof response.data === "string" ? response.data : null;
        this.destroy(new StorageError(response.statusCode, msg));
      }

      if (httpRequest.contentTypeIsJSON(response.headers[ "content-type" ]))
        results = JSON.parse(response.data);
      else
        results = response.data;

      // push results to stream
      this.encoder.parseData(results, this.options, (construct) => {
        construct = this.encoder.cast(construct);
        construct = this.encoder.filter(construct);
        construct = this.encoder.select(construct);
        if (construct)
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
