/**
 * mysql/reader
 */
"use strict";

const { StorageReader } = require('../storage-junction');
const { StorageError } = require('../../types');
const { logger, waitFor } = require('@dictadata/lib');
const sqlEncoder = require('./mysql-encoder-sql');

const BATCH_SIZE = 128;

module.exports = exports = class MySQLReader extends StorageReader {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    super(storageJunction, options);

    // request
    this.sql;
    this.offset = 0;
    this.count = this.options.pattern?.count || this.options.count;

    // results
    this.rows;
    this.pos;
    this.len;
    this.count;

    // reader state
    this.started = false;
    this.running = false;
    this.paused = false;
    this.cancelled = false;
  }

  async _construct(callback) {
    logger.debug("MySQLReader._construct");

    try {
      await this.queryBatch();

      callback();
    }
    catch (err) {
      logger.warn("MySQLReader: " + (err.code || err.message));
      callback(this.stfs?.StorageError(err) || new StorageError('MySQLReader construct error'));
    }
  }

  async queryBatch() {

      // open output stream
    let pattern = Object.assign({ LIMIT: BATCH_SIZE, OFFSET: this.offset }, this.options.pattern);
    this.sql = sqlEncoder.sqlSelectByPattern(this.engram, pattern);

    this.rows = await this.junction.pool.query(this.sql);
    this.pos = 0;
    this.len = this.rows.length;
    this.offset += this.len;
  }

  async reader() {
    await waitFor(this, "running", false);
    // console.log("reader entry");
    this.running = true;

    try {
      if (this.pos >= this.len) {
        this.running = false;
        return;
      }

      for (; this.pos < this.len; this.pos++) {
        if (this.paused || this.cancelled)
          break;

        let row = this.rows[ this.pos ];
        sqlEncoder.decodeResults(this.engram, row);
        await this.output(row);

        if (this.count && (this._stats.count >= this.count)) {
          this.cancelled = true;
        }

        if (!this.cancelled && (this.pos + 1 === this.len) && (this.len === BATCH_SIZE) && (!this.count || this.offset < this.count)) {
          // get next batch of rows
          await this.queryBatch();
          this.pos = -1;  // will increment at end of loop
        }

      }

      if (!this.paused || this.cancelled) {
        // end of input
        this.push(null);
      }

    }
    catch (err) {
      logger.warn("MySQLReader: " + (err.code || err.message));
      this.destroy(err);
    }

    // console.log("reader exit");
    this.running = false;
  }

  /**
   * waiting on output helps with node micro-tasking
   * @param {*} construct
   */
  async output(construct) {

    this._stats.count += 1;
    if (!this.push(construct)) {
      // console.log("output paused");
      this.paused = true;  // If push() returns false then pause reading from source.
    }

    if (this._stats.count % 100000 === 0)
      logger.verbose(this._stats.count + " " + this._stats.interval + "ms");
  }

  _destroy(err) {
    this.cancelled = true;
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    logger.debug('MySQLReader _read');

    // read up to size constructs
    if (!this.started) {
      this.started = true;
      this.reader();
    }
    else if (this.paused) {
      // console.log("output resumed");
      this.paused = false;
      this.reader();
    }

  }

};
