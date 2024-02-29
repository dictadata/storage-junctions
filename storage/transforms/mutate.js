/**
 * storage/transforms/mutate.js
 *
 * Select, inject and remove fields.
 * Map field names with ability to flatten or expand construct structure.
 * Default, assign and override field values.
 */
"use strict";

const { Transform } = require('stream');
const { dot, evaluate, hasOwnProperty } = require("../utils");

// order of operations:
//   default
//   select | map | (all fields)
//   assign
//   override
//   remove

// example mutate transform
/*
  {
    transform: "mutate",

    // set default values or inject new fields first
    default: {
      "field-name": <value>,
      ...
    },

    // select fields
    select: ['field-name', 'field-name', ...]

    // map fields
    map: {
      <new-field-name>: <value>,
      ...
    },

    // modify field value with a function body
    // (construct) => { return some-value; }
    assign: {
      "field-name": "function body",
      ...
    }

    // override field values or inject new fields last
    override: {
      "field-name": <value>,
      ...
    }

    // remove fields from the new construct
    remove: ["field-name", "field-name", ...]

  };
*/

// value
//   literal
//   =value-expression
//
// value-expression (with string concatenation)
//   exp-value
//   exp-value + exp-value + ...
//
// exp-value
//   field-name | 'literal string'


module.exports = exports = class MutateTransform extends Transform {

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

    // mutation functions
    this.mutations = {};
    if (hasOwnProperty(options, 'assign')) {
      for (let [ name, body ] of Object.entries(options.assign)) {
        this.mutations[ name ] = new Function('construct', body);
      }
    }
  }

  /**
   * Internal call from streamWriter to process an object
   * @param {*} construct
   * @param {*} encoding
   * @param {*} callback
   */
  _transform(construct, encoding, callback) {
    let newConstruct = {};

    // default
    if (this.options.default)
      for (let [ name, value ] of Object.entries(this.options.default)) {
        dot.assign(name, newConstruct, evaluate(value, construct));
      }

    // select
    if (this.options.select) {
      for (let name of this.options.select)
        if (hasOwnProperty(construct, name))
          dot.assign(name, newConstruct, dot.pick(name, construct));
    }
    // map
    else if (this.options.map) {
      for (let [ name, value ] of Object.entries(this.options.map)) {
        dot.assign(name, newConstruct, evaluate(value, construct));
      }
    }
    else {
      // copy the entire construct
      Object.assign(newConstruct, construct);
    }

    // assign values
    if (this.options.assign) {
      for (let name of Object.keys(this.options.assign)) {
        dot.assign(name, newConstruct, this.mutations[ name ](newConstruct));
      }
    }

    // override
    if (this.options.override) {
      for (let [ name, value ] of Object.entries(this.options.override)) {
        dot.assign(name, newConstruct, evaluate(value, newConstruct));
      }
    }

    // remove
    if (this.options.remove) {
      for (let name of this.options.remove)
        delete newConstruct[ name ];
    }

    this.push(newConstruct);
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
