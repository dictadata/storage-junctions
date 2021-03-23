"use strict";

const { Readable } = require('stream');
const { hasOwnProperty, StorageError } = require("../../types");
const logger = require('../../logger');

module.exports = exports = class StorageReader extends Readable {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    if (!hasOwnProperty(storageJunction, "engram"))
      throw new StorageError({statusCode: 400}, "Invalid parameter: storageJunction");

    let streamOptions = {
      objectMode: true,
      highWaterMark: 128,
      autoDestroy: false
    };
    super(streamOptions);

    this.junction = storageJunction;
    this.smt = storageJunction.smt;
    this.engram = storageJunction.engram;

    this.options = Object.assign({}, storageJunction.options.reader, options);

    this._statistics = {
      count: 0,
      elapsed: 0
    }
    this._startms = 0;
    this.progress = this.options.progress || null;
    this.progressModula = this.options.progressModula || 1000;

    // Set Capabilities of the StorageReader

    // useTransforms
    // derived classes should declare useTransforms=true if
    //    the data source doesn't support queries
    // then base StorageJunction.getReader function create a pipeline and
    //   use FilterTransform for options.match
    //   use SelectTransform for options.fields
    //this.useTransforms = true;
  }

  get statistics() {
    return this._statistics;
  }

  push(chunk,encoding) {
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

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _read(size) {
    logger.debug('StorageReader _read');
    throw new StorageError({statusCode: 501}, "StorageReader._read method not implemented");
  }

};
