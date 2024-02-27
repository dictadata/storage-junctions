/**
 * storage/transforms/filter.js
 */
"use strict";

const { Transform } = require('stream');
const { match } = require("../utils");

// example filter transform
/*
  {
    transform: "filter",

    // match all expressions to forward
    match: {
      "field1": 'value',
      "field2": {gt: 100, lt: 200},
      "field3": ['keyword1','keyword2',...],
      "field4": /ab+c/i
    },

    // match all expressions to drop
    drop: {
      "field1": 'value',
      "field2": { lte: 0 },
      'field3": [1,2,3],
      'field4": /ab+c/i
      }
    }
  };
*/

module.exports = exports = class FilterTransform extends Transform {

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

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {

    // do some match filterin'
    if (match(this.options.match, construct) && !match(this.options.drop, construct))
      this.push(construct);

    callback();
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
