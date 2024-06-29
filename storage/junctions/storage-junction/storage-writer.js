"use strict";

const { Writable } = require('node:stream');
const { StorageError } = require('../../types');
const { logger } = require('@dictadata/lib');

module.exports = exports = class StorageWriter extends Writable {

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
      highWaterMark: 128
    };
    super(streamOptions);

    this.junction = junction;
    this.smt = junction.smt;
    this.engram = junction.engram;

    this.options = Object.assign({}, options);

    // if autoClose is true StorageWriters should close dependent write streams in _final().
    this.autoClose = ('autoClose' in this.options) ? this.options.autoClose : true;

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

  async _construct(callback) {
    logger.debug("StorageWriter._construct");

    try {
      // open output stream

      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError('StorageWriter construct error'));
    }
  }

  async _write(construct, encoding, callback) {
    logger.debug("StorageWriter._write");

    //logger.debug(JSON.stringify(construct));
    // check for empty construct
    if (Object.keys(construct).length === 0) {
      callback();
      return;
    }

    try {
      this._stats.count += 1;
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
      this._stats.count += chunks.length;

      for (var i = 0; i < chunks.length; i++) {
        let construct = chunks[ i ].chunk;
        let encoding = chunks[ i ].encoding;

        // save construct to .schema
        await this.junction.store(construct);
      }
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError(500, 'Error storing construct', { cause: err }));
    }
  }

  async _final(callback) {
    logger.debug('StorageWriter._final');

    try {
      callback();
    }
    catch (err) {
      logger.warn(err.message);
      callback(new StorageError(500, 'Error writer._final', { cause: err }));
    }
  }

};
