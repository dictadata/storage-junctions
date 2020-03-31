/**
 * elasticsearch/reader
 */
"use strict";

const StorageReader = require('../junction/reader');
const logger = require('../logger');

module.exports = exports = class ElasticsearchReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.started = false;

    this.params = {
      index: this.engram.smt.schema,
      scroll: '30s',
      size: 1,
      body: {
        query: {
          match_all: {}
        },
        sort: [ "_doc" ]
      }
    };
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of objects to read asynchronously (optional)
   */
  async _read(size) {
    logger.debug("ElasticsearchReader _read");

    // read up to size constructs
    var client = this.junction.elasticQuery.client;
    var response = null;

    try {
      if (!this.started) {
        this.started = true;
        this.params.size = size;
        response = await client.search(this.params);
      }
      else {
        response = await client.scroll({
          scroll_id: this._scroll_id,
          scroll: this.params.scroll
        });
      }

      this._scroll_id = response.body._scroll_id;
      const hits = response.body.hits.hits;

      for (const hit of hits) {
        this.push(hit._source);
      }

      if (hits.length === 0 || !response.body._scroll_id) {
        client.clearScroll({ scroll_id: this._scroll_id });  // release scroll resources on the elasticsearch node
        this.push(null); // done
      }
    }
    catch (err) {
      logger.error("elastic reader: ", err);
      this.push(null); // done
    }

  }

};
