/**
 * storage/transforms/filter.js
 */
"use strict";

const { Transform } = require('node:stream');
const { match } = require("@dictadata/lib/utils");

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
    let matched = true;
    if (this.options.match)
      matched = match(this.options.match, construct);
    if (matched && this.options.drop)
      matched = !match(this.options.drop, construct);

    if (matched)
      this.push(construct);

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
