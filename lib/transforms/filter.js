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
        "field2": {gt: 100, lt: 200},
        "field3": ['keyword1','keyword2',...],
        "field4": /ab+c/i
      },
      // match all expressions to drop
      drop: {
        "field1": 'value',
        "field2": { lt: 0 },
        'field3": [1,2,3],
        'field4": /ab+c/i
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
    for (let [fldname,criteria] of Object.entries(match)) {
      let exists = Object.prototype.hasOwnProperty.call(construct,fldname);

      if (Array.isArray(criteria)) {
        forward = exists && criteria.includes(construct[fldname]);
      }
      else if (criteria instanceof RegExp) {
        forward = exists && criteria.test(construct[fldname]);
      }
      else if (typeof criteria === 'object') {
        // expression(s) { op: value, ...}
        for (let [op,value] of Object.entries(criteria)) {
          switch (op) {
            case 'eq':  forward = exists && (construct[fldname] === value); break;
            case 'neq': forward = !exists || (construct[fldname] !== value); break;
            case 'lt':  forward = exists && (construct[fldname] < value); break;
            case 'lte': forward = exists && (construct[fldname] <= value); break;
            case 'gt':  forward = exists && (construct[fldname] > value); break;
            case 'gte': forward = exists && (construct[fldname] >= value); break;
            case 'exists': forward = exists; break;
            default: break;  // ignore bad operators
          }
        }
      }
      else {
        // single property { field: value }
        forward = exists && (construct[fldname] === criteria);
      }

      // check short-circuit
      if (!forward) break;
    }

    let dropit = false;
    if (forward) {
      // do some drop filterin'
      // match all expressions to drop
      for (let [fldname,criteria] of Object.entries(drop)) {
        let exists = Object.prototype.hasOwnProperty.call(construct,fldname);

        if (Array.isArray(criteria)) {
          dropit = exists && criteria.includes(construct[fldname]);
        }
        else if (criteria instanceof RegExp) {
          dropit = exists && criteria.test(construct[fldname]);
        }
        else if (typeof criteria === 'object') {
          // expression(s) { op: value, ...}
          for (let [op,value] of Object.entries(criteria)) {
            switch (op) {
              case 'eq':  dropit = exists && (construct[fldname] === value); break;
              case 'neq': dropit = !exists || (construct[fldname] !== value); break;
              case 'lt':  dropit = exists && (construct[fldname] < value); break;
              case 'lte': dropit = exists && (construct[fldname] <= value); break;
              case 'gt':  dropit = exists && (construct[fldname] > value); break;
              case 'gte': dropit = exists && (construct[fldname] >= value); break;
              case 'exists': dropit = exists; break;
              default: break;  // ignore bad operators
            }
          }
        }
        else {
          // single property { field: value }
          dropit = exists && (construct[fldname] === criteria);
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
