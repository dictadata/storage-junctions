/**
 * StorageTransform
 *
 * Intended to be used as an alternative when implementing a storage reader or writer.
 */
"use strict";

const { Transform } = require('node:stream');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

module.exports = exports = class StorageTransform extends Transform {

  /**
   *
   * @param {*} junction
   * @param {*} options
   */
  constructor(junction, options) {
    if (!Object.hasOwn(junction, "engram"))
      throw new StorageError(400, "Invalid parameter: junction");

    let streamOptions = {
      objectMode: true,
      highWaterMark: 32
    };
    super(streamOptions);

    this.junction = junction;
    this.smt = junction.smt;
    this.engram = junction.engram;

    this.options = Object.assign({}, options);

    this._stats = {
      start: Date.now(),
      timer: Date.now(),
      count: 0,

      get interval() {
        let lt = this.timer;
        this.timer = Date.now();
        return (this.timer - lt);
      },

      get elapsed() {
        return Date.now() - this.start;
      }
    }
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of constructs to read asynchronously
   */
  async _transform(size) {
    logger.debug('StorageTransform _transform');
    this.destroy(new StorageError(501, "StorageTransform._read method not implemented"));
  }

};
