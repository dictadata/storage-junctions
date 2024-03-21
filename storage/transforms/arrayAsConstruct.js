/**
 * storage/transforms/rowConstructs.js
 */
"use strict";

const { Transform } = require('node:stream');

/**
 * Transforms row (array) data to construct object.
 * Requires options.headers[] which enumerates property names.
 */
module.exports = exports = class RowConstructsTransform extends Transform {

  /**
   * If headers are not set in options then the first row seen is assumed to be the headers.
   *
   * @param {Object} options
   * @param {Array} options.headers
   */
  constructor(options = {}) {
    let streamOptions = {
      writableObjectMode: true,
      readableObjectMode: true
    };
    super(streamOptions);

    this.headers = options.headers || undefined;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} row
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(row, encoding, callback) {
    if (!this.headers) {
      this.headers = row;
    }
    else {
      let construct = {};
      for (let i = 0; i < row.length; i++) {
        let prop = (i < this.headers.length) ? this.headers[ i ] : i;
        construct[ prop ] = construct[ i ];
      }
      this.push(construct);
    }
    callback();
  }

  /*
    _flush(callback) {
      logger.debug("transform _flush");

      // push some final object(s)
      //this.push(this._composition);

      callback();
    }
  */
};
