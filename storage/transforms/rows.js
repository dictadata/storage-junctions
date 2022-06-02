/**
 * storage/transforms/rows.js
 */

const { Transform } = require('stream');

/**
 * Transforms row data (array) to JSON object.
 */
module.exports = exports = class RowsTransform extends Transform {

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
      let obj = {};
      for (let i = 0; i < row.length; i++) {
        let prop = (i < this.headers.length) ? this.headers[ i ] : i;
        obj[ prop ] = row[ i ];
      }
      this.push(obj);
    }
    callback();
  }

  _flush(callback) {
    callback();
  }
};
