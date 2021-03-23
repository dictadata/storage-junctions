/**
 * elasticsearch/reader
 */
"use strict";

const { StorageReader } = require('../storage');
const logger = require('../logger');

const dslEncoder = require("./encoder_dsl");


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
        let params = Object.assign({}, this.elasticQuery.elasticParams, this.scrollParams, { body: dsl, size: size, sort: ["_doc"] });
        logger.debug(JSON.stringify(params));
        response = await this.elasticQuery.client.search(params);
      }
      else {
        response = await this.elasticQuery.client.scroll(this.scrollParams);
      }

      this.scrollParams.scrollId = response.body._scroll_id;
      const hits = response.body.hits.hits;

      for (const hit of hits) {
        this.push(hit._source);
      }

      if (hits.length === 0 || !response.body._scroll_id) {
        // release scroll resources on the elasticsearch node
        this.elasticQuery.client.clearScroll({ scrollId: this.scrollParams.scrollId });
        delete this.scrollParams.scrollId;
        this.push(null); // done
      }
    }
    catch (err) {
      logger.error("elastic reader: ", err);
      this.push(null); // done
    }

  }

};
