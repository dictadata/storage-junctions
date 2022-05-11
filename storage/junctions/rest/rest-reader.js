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
      let urlParams = this.options.urlParams;
      if (urlParams) {
        baseURL = templateReplace(baseURL, urlParams);
        url = templateReplace(url, urlParams);
      }

      let req_config = Object.assign({
        method: "GET",
        base: baseURL,
        headers: {
          'Accept': 'application/json',
          'User-Agent': '@dictadata.org/storage'
        },
        timeout: 10000
      }, this.options.http || {});
      // note, a pattern will override req_config["query"]

      let data = this.options.data;  // a pattern will override data

      if (this.options) {
        // pattern will override options.data
        let params = this.options.params || this.options.match || {};
        if (req_config.method === "GET")
          req_config.params = params;  // querystring
        else
          data = params;
      }

      let results;
      let response = await httpRequest(url, req_config, data);

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
