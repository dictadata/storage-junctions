"use strict";

/**
 * Decompose (flatten) a hierarchical object into a stream of flattened (row) objects.
 */

const { Transform } = require('stream');
const { typeOf, logger } = require("../utils");

// example decompose transform
/*
  transform: {
    "flatten": {
      // field names for hierarchy properties
      // in hierarchical order
      path: ['name1', 'name2', ...]
    }
  };
*/

module.exports = exports = class DecomposeTransform extends Transform {

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
  }

  decompose(level, row, data, cb) {

    if (level < this.options.path.length) {
      // flatten this level
      let fname = this.options.path[level];
      for (let [name, value] of Object.entries(data)) {
        row[fname] = name;
        if (typeOf(value) == "object") {
          let rRow = Object.assign({}, row);
          this.decompose(level + 1, rRow, value, cb);
        }
      }
    }
    else {
      // output row
      Object.assign(row, data);
      this.push(row);
    }
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {

    try {
      let level = 0;
      let row = {};
      this.decompose(level, row, construct);
      
      callback();
    }
    catch (err) {
      logger.error(err);
      callback(err);
    }
  }

  /* optional */
  /*
  _flush(callback) {

    // push some final object(s)
    this.push({results: 'x'})
    callback();
  }
  */

};
