"use strict";

const { Transform } = require('stream');
const {StorageError} = require("../types");
const logger = require('../logger');

// example filter transform
/*
  transforms: {
    "filter": {
      // forward constructs that match these expressions
      match: {
        "field1": {
          op: 'eq',
          value: 'abc'
        }
      },
      // drop constructs that match these expressions
      drop: {
        "field2": {
          op: 'lte',
          value: '2.5'
        }
      }
    }
  };
*/

module.exports = exports = class FieldsTransform extends Transform {

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

    this.options = options;
    this.logger = options.logger || logger;
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {
    let forward = true;

    if (this.options.match) {
      // do some filterin
      for (let [name, exp] of Object.entries(this.options.match)) {
        switch (exp.op) {
          case 'eq':
            forward = forward && construct[name] && (construct[name] === exp.value);
            break;
          case 'neq':
            forward = forward && construct[name] && (construct[name] !== exp.value);
            break;
          case 'lt':
            forward = forward && construct[name] && (construct[name] < exp.value);
            break;
          case 'lte':
            forward = forward && construct[name] && (construct[name] <= exp.value);
            break;
          case 'gt':
            forward = forward && construct[name] && (construct[name] > exp.value);
            break;
          case 'gte':
            forward = forward && construct[name] && (construct[name] >= exp.value);
            break;
          case 'exists':
            forward = forward && construct[name];
            break;
          default:
            break;
        }

        if (!forward)
          break;
      }
    }

    if (forward && this.options.drop) {
      // do some filterin
      for (let [name, exp] of Object.entries(this.options.drop)) {
        switch (exp.op) {
          case 'eq':
            forward = forward && construct[name] && !(construct[name] === exp.value);
            break;
          case 'neq':
            forward = forward && construct[name] && !(construct[name] !== exp.value);
            break;
          case 'lt':
            forward = forward && construct[name] && !(construct[name] < exp.value);
            break;
          case 'lte':
            forward = forward && construct[name] && !(construct[name] <= exp.value);
            break;
          case 'gt':
            forward = forward && construct[name] && !(construct[name] > exp.value);
            break;
          case 'gte':
            forward = forward && construct[name] && !(construct[name] >= exp.value);
            break;
          case 'exists':
            forward = forward && !construct[name];
            break;
          default:
            break;
        }

        if (!forward)
          break;
      }
    }

    if (forward) {
      this.push(construct);
    }

    callback();
  }

  /* optional */
  /*
  _flush(callback) {

    // push some final object(s)
    this.push({results: 'x'})
  }
  */

};
