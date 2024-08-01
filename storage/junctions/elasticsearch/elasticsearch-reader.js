/**
 * elasticsearch/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

const dslEncoder = require('./elasticsearch-encoder-dsl');

const BATCH_SIZE = 128;

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
    this.initialSize = BATCH_SIZE;

    this.params;
    this.response;
    this.hits;
    this.started = false;
    this.paused = false;
    this.cancelled = false;
  }

  async _construct(callback) {
    logger.debug("ElasticsearchReader._construct");

    try {
      // open output stream
      const pattern = this.options.pattern || {};
      let dsl = dslEncoder.searchQuery(pattern);

      this.params = Object.assign({}, this.elasticQuery.elasticParams, this.scrollParams);
      if (!Object.hasOwn(dsl, "size")) this.params.size = this.initialSize;
      if (!Object.hasOwn(dsl, "sort")) this.params.sort = [ "_doc" ];
      this.params.body = dsl;
      logger.debug("dsl: " + JSON.stringify(this.params));

      this.response = await this.elasticQuery.client.search(this.params);
      this.scrollParams.scroll_id = this.response._scroll_id;
      this.hits = this.response.hits.hits;
      this.pos = 0;
      this.len = this.hits.length;

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(this.stfs?.StorageError(err) || new StorageError('ElasticsearchReader construct error'));
    }
  }

  async reader() {
    if (this.pos >= this.len) {
      if (this.hits.length === 0)
        this.push(null); // done
      return;
    }

    try {
      for (; this.pos < this.len; this.pos++) {
        if (this.paused || this.cancelled)
          break;

        let hit = this.hits[ this.pos ];
        await this.output(hit._source);

        if (this.pos + 1 === this.len) {
          // load up some more
          this.response = await this.elasticQuery.client.scroll(this.scrollParams);
          //this.scrollParams.scroll_id = this.response._scroll_id;
          this.hits = this.response.hits.hits;
          this.pos = -1;  // will increment to 0 at end of loop
          this.len = this.hits.length;
        }
      }

      if (!this.paused || this.cancelled) {
        // release scroll resources on the elasticsearch node
        await this.elasticQuery.client.clearScroll({ scroll_id: this.scrollParams.scroll_id });
        this.push(null); // done
      }
    }
    catch (err) {
      logger.warn("ElasticsearchReader: ", err.message);
      this.destroy(err);
      throw err;
    }

  }

  _destroy(err) {
    this.cancelled = true;
  }

  /**
   * waiting on output helps with node micro-tasking
   * @param {*} construct
   */
  async output(construct) {

    this._stats.count += 1;
    if (!this.push(construct)) {
      // this.parser.pause();  // If push() returns false then pause reading from source.
    }

    if (this._stats.count % 100000 === 0)
      logger.verbose(this._stats.count + " " + this._stats.interval + "ms");
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of objects to read asynchronously (optional)
   */
  async _read(size) {
    logger.debug("ElasticsearchReader _read");

    if (!this.started) {
      this.started = true;
      this.reader();
    }
    else if (this.paused) {
      this.pause = false;
      this.reader();
    }
  }

};
