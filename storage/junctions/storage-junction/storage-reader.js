"use strict";

const { Readable } = require('node:stream');
const { StorageError } = require("../../types");
const { logger } = require("../../utils");

module.exports = exports = class StorageReader extends Readable {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    if (!Object.hasOwn(storageJunction, "engram"))
      throw new StorageError(400, "Invalid parameter: storageJunction");

    let streamOptions = {
      objectMode: true,
      highWaterMark: 128,
      autoDestroy: false
    };
    super(streamOptions);

    this.junction = storageJunction;
    this.smt = storageJunction.smt;
    this.engram = storageJunction.engram;

    this.options = Object.assign({}, options);

    this._statistics = {
      count: 0,
      elapsed: 0
    };
    this._startms = 0;
    this.progress = this.options.progress || null;
    this.progressModula = this.options.progressModula || 1000;
  }

  get statistics() {
    return this._statistics;
  }

  push(chunk, encoding) {
    if (this._startms <= 0)
      this._startms = Date.now();
    if (chunk === null)
      this._statistics.elapsed = Date.now() - this._startms;
    else
      this._statistics.count++;

    if (this.progress && (this._statistics.count % this.progressModula === 0)) {
      this._statistics.elapsed = Date.now() - this._startms;
      this.progress(this._statistics);
    }

    super.push(chunk, encoding);
  }

  async _construct(callback) {
    logger.debug("StorageReader._construct");

    try {
      // open output stream

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError('StorageReader construct error'));
    }
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(size) {
    logger.debug('StorageReader _read');
    this.destroy(new StorageError(501, "StorageReader._read method not implemented"));
  }

};
