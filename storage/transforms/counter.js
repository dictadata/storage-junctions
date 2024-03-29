/**
 * storage/transforms/counter
 *
 * count number of constructs in stream
 * insert or removes named counter property to construct
 */
"use strict";

const { Transform } = require('node:stream');
const { logger } = require('../utils');

module.exports = exports = class CounterTransform extends Transform {

  /**
   *
   * @param {*} options transform options
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 128
    };
    super(streamOptions);

    this.options = Object.assign({}, options);

    this.count = 0;
    this.name = options.name || "_count";
    this.remove = options.remove || false;
  }

  /**
   * Calculate field statistics by examining construct(s).
   * Stores stats to this.engram.fields.
   *
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {
    logger.debug("counter _transform");

    try {
      if (this.remove && construct[ this.name ]) {
        delete construct[ this.name ];
      }
      else {
        this.count++;
        construct[ this.name ] = this.count;
      }

      this.push(construct);
    }
    catch (err) {
      logger.warn("counter error: " + err.message);
    }

    callback();
  }

  /*
    _flush(callback) {
      logger.debug("counter _flush");

      // push some final object(s)
      //this.push(this._composition);

      callback();
    }
  */
};
