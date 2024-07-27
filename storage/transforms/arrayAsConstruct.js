/**
 * storage/transforms/arrayAsConstruct
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
   * @param {object} options
   * @param {boolean}  options.hasHeader input includes a header row, default false
   * @param {string[]} options.headers values to use for field names, default undefined
   */
  constructor(options = {}) {
    let streamOptions = {
      objectMode: true
    };
    super(streamOptions);

    this.hasHeader = options.hasHeader || false;
    this.headers = options.headers || undefined;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} row
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(row, encoding, callback) {
    if (this.hasHeader && !this._headers) {
      this._headers = row;
      if (!this.headers)
        this.headers = row;
    }
    else {
      let construct = {};
      for (let i = 0; i < row.length; i++) {
        let name = this.headers[ i ] || i;
        construct[ name ] = row[ i ];
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
