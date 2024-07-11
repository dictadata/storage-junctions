/**
 * elasticsearch/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const dslEncoder = require('./elasticsearch-encoder-dsl');


module.exports = exports = class ElasticsearchReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    this.elasticQuery = this.junction.elasticQuery;
    this.scrollParams = {
      scroll: '30s'
    };
    this.initialSize = 100;
    this.response = null;
  }

  async _construct(callback) {
    logger.debug("ElasticsearchReader._construct");

    try {
      // open output stream
      const pattern = this.options.pattern || this.options || {};
      let dsl = dslEncoder.searchQuery(pattern);

      let params = Object.assign({}, this.elasticQuery.elasticParams, this.scrollParams);
      if (!Object.hasOwn(dsl, "size")) params.size = this.initialSize;
      if (!Object.hasOwn(dsl, "sort")) params.sort = [ "_doc" ];
      params.body = dsl;
      logger.debug("dsl: " + JSON.stringify(params));

      this.response = await this.elasticQuery.client.search(params);

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('ElasticsearchReader construct error'));
    }
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of objects to read asynchronously (optional)
   */
  async _read(size) {
    logger.debug("ElasticsearchReader _read");

    // read up to size constructs
    try {
      if (!this.response) {
        this.response = await this.elasticQuery.client.scroll(this.scrollParams);
      }

      this.scrollParams.scroll_id = this.response._scroll_id;
      const hits = this.response.hits.hits;

      for (const hit of hits) {
        this._stats.count += 1;
        this.push(hit._source);
      }

      if (hits.length === 0 || !this.response._scroll_id) {
        // release scroll resources on the elasticsearch node
        this.elasticQuery.client.clearScroll({ scroll_id: this.scrollParams.scroll_id });
        delete this.scrollParams.scroll_id;
        this.push(null); // done
      }

      this.response = null;
    }
    catch (err) {
      logger.warn("ElasticsearchReader: ", err.message);
      this.destroy(err);
    }

  }

};
