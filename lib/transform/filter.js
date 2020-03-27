"use strict";

const { Transform } = require('stream');
const {StorageError} = require("../types");
const logger = require('../logger');

// example filter transform
/*
  transform: {
    "filter": {
      // match all expressions to forward
      match: {
        "field1": 'value',
        "field2": {gt: 100, lt: 200}
      },
      // match all expressions to drop
      drop: {
        "field1": 'value',
        "field2": { lt: 0 }
        }
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
    let match = this.options.match || {};
    let drop = this.options.drop || {};

    // do some match filterin'
    // match all expessions to forward
    let forward = true;
    for (let [fldname,value] of Object.entries(match)) {
      let exists = Object.prototype.hasOwnProperty.call(construct,fldname);

      if (typeof value === 'object') {
        // expression(s) { op: value, ...}
        for (let [op,val] of Object.entries(value)) {
          switch (op) {
            case 'eq':  forward = exists && (construct[fldname] === val); break;
            case 'neq': forward = !exists || (construct[fldname] !== val); break;
            case 'lt':  forward = exists && (construct[fldname] < val); break;
            case 'lte': forward = exists && (construct[fldname] <= val); break;
            case 'gt':  forward = exists && (construct[fldname] > val); break;
            case 'gte': forward = exists && (construct[fldname] >= val); break;
            case 'exists': forward = exists; break;
            default: break;  // ignore bad operators
          }
        }
      }
      else {
        // single property { field: value }
        forward = exists && (construct[fldname] === value);
      }

      // check short-circuit
      if (!forward) break;
    }

    let dropit = false;
    if (forward) {
      // do some drop filterin'
      // match all expressions to drop
      for (let [fldname,value] of Object.entries(drop)) {
        let exists = Object.prototype.hasOwnProperty.call(construct,fldname);

        if (typeof value === 'object') {
          // expression(s) { op: value, ...}
          for (let [op,val] of Object.entries(value)) {
            switch (op) {
              case 'eq':  dropit = exists && (construct[fldname] === val); break;
              case 'neq': dropit = !exists || (construct[fldname] !== val); break;
              case 'lt':  dropit = exists && (construct[fldname] < val); break;
              case 'lte': dropit = exists && (construct[fldname] <= val); break;
              case 'gt':  dropit = exists && (construct[fldname] > val); break;
              case 'gte': dropit = exists && (construct[fldname] >= val); break;
              case 'exists': dropit = exists; break;
              default: break;  // ignore bad operators
            }
          }
        }
        else {
          // single property { field: value }
          dropit = exists && (construct[fldname] === value);
        }

        // check short-circuit
        if (!dropit) break;
      }
    }

    if (forward && !dropit) {
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
