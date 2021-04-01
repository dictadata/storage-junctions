"use strict";

const { Writable } = require('stream');
const { StorageError } = require("../../types");
const { hasOwnProperty, logger } = require("../../utils");

module.exports = exports = class StorageWriter extends Writable {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    if (!hasOwnProperty(storageJunction, "engram"))
      throw new StorageError( 400, "Invalid parameter: storageJunction");

    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.junction = storageJunction;
    this.smt = storageJunction.smt;
    this.engram = storageJunction.engram;

    this.options = Object.assign({}, storageJunction.options.writer, options);

    this._statistics = {
      count: 0,
      elapsed: 0
    }
    this._startms = 0;
    this.progress = this.options.progress || null;
    this.progressModula = this.options.progressModula || 1000;
  }

  get statistics() {
    return this._statistics;
  }

  _count(count) {
    if (this._startms <= 0)
      this._startms = Date.now();
    if (count === null)
      this._statistics.elapsed = Date.now() - this._startms;
    else
      this._statistics.count += count;
    
    if (this.progress && (this._statistics.count % this.progressModula === 0)) {
      this._statistics.elapsed = Date.now() - this._startms;
      this.progress(this._statistics);
    }
  }

  async _write(construct, encoding, callback) {
    logger.debug("StorageWriter._write");
    logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      this._count(1);
      await this.junction.store(construct);
      callback();
    }
    catch (err) {
      logger.debug(err.message);
      callback(err);
    }
  }

  async _writev(chunks, callback) {
    logger.debug("StorageWriter._writev");

    try {
      this._count(chunks.length);

      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[i].chunk;
        let encoding = chunks[i].encoding;

        // save construct to .schema
        await this.junction.store(construct);
      }
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError(500, 'Error storing construct').inner(err));
    }
  }

  async _final(callback) {
    logger.debug('StorageWriter._final');
    try {
      this._count(null);
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(new StorageError(500, 'Error writer._final').inner(err));
    }
  }

};
