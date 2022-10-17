/**
 * elasticsearch/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { logger, hasOwnProperty } = require('../../utils');

const dslEncoder = require("./elasticsearch-encoder-dsl");


module.exports = exports = class ElasticsearchReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.started = false;

    this.elasticQuery = this.junction.elasticQuery;

    this.scrollParams = {
      scroll: '30s'
    };
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of objects to read asynchronously (optional)
   */
  async _read(size) {
    logger.debug("ElasticsearchReader _read");

    // read up to size constructs
    var response = null;

    try {
      if (!this.started) {
        this.started = true;
        let dsl = dslEncoder.searchQuery(this.options);

        let params = Object.assign({}, this.elasticQuery.elasticParams, this.scrollParams);
        if (!hasOwnProperty(dsl, "size")) params.size = size;
        if (!hasOwnProperty(dsl, "sort")) params.sort = [ "_doc" ];
        params.body = dsl;
        logger.verbose("params: " + JSON.stringify(params));

        response = await this.elasticQuery.client.search(params);
      }
      else {
        response = await this.elasticQuery.client.scroll(this.scrollParams);
      }

      this.scrollParams.scroll_id = response._scroll_id;
      const hits = response.hits.hits;

      for (const hit of hits) {
        this.push(hit._source);
      }

      if (hits.length === 0 || !response._scroll_id) {
        // release scroll resources on the elasticsearch node
        this.elasticQuery.client.clearScroll({ scroll_id: this.scrollParams.scroll_id });
        delete this.scrollParams.scroll_id;
        this.push(null); // done
      }
    }
    catch (err) {
      logger.error("elastic reader: ", err.message);
      this._destroy(err);
    }

  }

};
