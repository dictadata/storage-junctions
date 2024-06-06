/**
 * storage/transforms/mutate.js
 *
 * Select, inject and remove fields.
 * Map field names with ability to flatten or expand construct structure.
 * Set defaults, map and override field values.
 */
"use strict";

const { Transform } = require('node:stream');
const { dot, evaluate } = require("@dictadata/lib/utils");

// order of operations:
//   default
//   select | map | (all fields)
//   list
//   func
//   assign
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
    select: ["field-name", ...]

    // map fields
    map: {
      "new-field-name": <value>,
      ...
    },

    // list, create array from fields and/or constants
    list: {
      "new-field_name": <value>,
      "new-field_name": [ <value>, ... ],
      ...
    }

    // modify field value with a function body
    func: {
      "field-name": "function body",
      ...
    }
    // where "function body" = "[statements...]; return some-value;"
    //
    // function call definition
    //   (construct, newConstruct) => { return some-value; }

    // assign field values, override values or inject new fields at end of object
    assign: {
      "field-name": <value>,
      ...
    }

    // remove fields from the new construct
    remove: ["field-name", ...]

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
    if (Object.hasOwn(options, 'func')) {
      for (let [ name, body ] of Object.entries(options.func)) {
        this.mutations[ name ] = new Function('construct', 'newConstruct', body);
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
        dot.set(name, newConstruct, evaluate(value, construct));
      }

    // select
    if (this.options.select) {
      for (let name of this.options.select)
        if (Object.hasOwn(construct, name))
          dot.set(name, newConstruct, dot.get(name, construct));
    }
    // map
    else if (this.options.map) {
      for (let [ name, value ] of Object.entries(this.options.map)) {
        dot.set(name, newConstruct, evaluate(value, construct));
      }
    }
    else {
      // copy the entire construct
      Object.assign(newConstruct, construct);
    }

    // list, create array from fields and/or constants
    if (this.options.list) {
      for (let [ name, items ] of Object.entries(this.options.list)) {
        let arr = [];
        if (typeof items === "string") {
          arr.push(evaluate(items, construct));
        }
        else if (Array.isArray(items)) {
          for (let item of items)
            arr.push(evaluate(item, construct))
        }
        dot.set(name, newConstruct, arr);
      }
    }

    // func, assign values with function
    if (this.options.func) {
      for (let name of Object.keys(this.options.func)) {
        dot.set(name, newConstruct, this.mutations[ name ](construct, newConstruct));
      }
    }

    // assign, override values or inject fields
    if (this.options.assign) {
      for (let [ name, value ] of Object.entries(this.options.assign)) {
        dot.set(name, newConstruct, evaluate(value, newConstruct));
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

  /*
    _flush(callback) {
      logger.debug("transform _flush");

      // push some final object(s)
      //this.push(this._composition);

      callback();
    }
  */
};
