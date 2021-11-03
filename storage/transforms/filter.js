"use strict";

const { Transform } = require('stream');
const { typeOf } = require("../utils");

const dot = require('dot-object');

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

    this.options = Object.assign({}, options);
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {
    const match = this.options.match || {};
    const drop = this.options.drop || {};

    // do some match filterin'
    // match all expessions to forward
    let forward = true;
    for (let [fldname,criteria] of Object.entries(match)) {
      let cvalue = dot.pick(fldname, construct);
      let exists = typeof (cvalue) !== "undefined";
      //let exists = hasOwnProperty(construct,fldname);

      if (Array.isArray(criteria)) {
        forward = exists && criteria.includes(cvalue);
      }
      else if (criteria instanceof RegExp) {
        forward = exists && criteria.test(cvalue);
      }
      else if (typeOf(criteria) === 'object') {
        // expression(s) { op: value, ...}
        for (let [op,value] of Object.entries(criteria)) {
          switch (op) {
            case 'eq':  forward = exists && (cvalue === value); break;
            case 'neq': forward = !exists || (cvalue !== value); break;
            case 'lt':  forward = exists && (cvalue < value); break;
            case 'lte': forward = exists && (cvalue <= value); break;
            case 'gt':  forward = exists && (cvalue > value); break;
            case 'gte': forward = exists && (cvalue >= value); break;
            case 'wc': forward = exists && wildcard(cvalue, value); break;
            case 'exists': forward = exists; break;
            default: break;  // ignore bad operators
          }
        }
      }
      else {
        // single property { field: value }
        forward = exists && (cvalue === criteria);
      }

      // check short-circuit
      if (!forward) break;
    }

    let dropit = false;
    if (forward) {
      // do some drop filterin'
      // match all expressions to drop
      for (let [fldname,criteria] of Object.entries(drop)) {
        let cvalue = dot.pick(fldname, construct);
        let exists = typeof (cvalue) !== "undefined";
        //let exists = hasOwnProperty(construct,fldname);

        if (Array.isArray(criteria)) {
          dropit = exists && criteria.includes(cvalue);
        }
        else if (criteria instanceof RegExp) {
          dropit = exists && criteria.test(cvalue);
        }
        else if (typeOf(criteria) === 'object') {
          // expression(s) { op: value, ...}
          for (let [op,value] of Object.entries(criteria)) {
            switch (op) {
              case 'eq':  dropit = exists && (cvalue === value); break;
              case 'neq': dropit = !exists || (cvalue !== value); break;
              case 'lt':  dropit = exists && (cvalue < value); break;
              case 'lte': dropit = exists && (cvalue <= value); break;
              case 'gt':  dropit = exists && (cvalue > value); break;
              case 'gte': dropit = exists && (cvalue >= value); break;
              case 'wc':  dropit = exists && wildcard(cvalue, value); break;
              case 'exists': dropit = exists; break;
              default: break;  // ignore bad operators
            }
          }
        }
        else {
          // single property { field: value }
          dropit = exists && (cvalue === criteria);
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
    callback();
  }
  */

};

function wildcard(str, rule) {
  // remove anything that could interfere with regex
  rule = rule.replace(/([.+^=!:${}()|\[\]\/\\])/g, "\\$1");
  rule = rule.split("?").join(".");
  rule = rule.split("*").join(".*");
  let result = new RegExp("^" + rule + "$").test(str);
  return result;
}
