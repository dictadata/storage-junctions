/**
 * storage/transforms/mutate.js
 *
 * Select, inject and remove fields.
 * Map field names with ability to flatten or expand construct structure.
 * Default, assign and override field values.
 */
"use strict";

const { Transform } = require('stream');
const { typeOf, hasOwnProperty } = require("../utils");

const dot = require('dot-object');

// order of operations:
//   default
//   select | map
//   modify
//   remove
//   override

// example mutate transform
/*
  transform: {
    mutate: {
      // set default values or inject new fields
      default: {
        "field-name": <value>,
        "new-field-name": <value>
      },

      // select fields
      select: ['field-name', 'field-name', ...],

      // map fields
      map: {
        "field-name": <new-field-name>,
        "object-name.field-name":  <new-field-name>
      },

      // modify field value with a function body
      // function is passed (value, construct) arguments
      assign: {
        "field-name": <value>,
        "field-name": "function body; return newValue"
      }

      // remove fields from the new construct
      remove: ["field-name", "field-name"],

      // override field values or inject new fields
      override: {
        "field-name": <value>,
        "new-field-name": <value>
      }

    }
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
        if (name[0] !== '=')
          this.mutations[ name ] = new Function('value', 'construct', body);
      }
    }
  }

  /**
   * Assign field value from existing field(s) and/or literal values
   * @param {*} stmt in the form "=dot.fieldname+'literal'+..."
   * @param {*} obj object to pick values from
   */
  assignment(stmt, obj) {
    let result = "";

    let parts = stmt.substr(1, stmt.length - 1).split('+');
    for (let p of parts) {
      if (p && p[ 0 ] === "'")
        // literal string
        result += p.substr(1, p.length - 2);
      else
        // field in construct
        result += dot.pick(p, obj);
    }

    return result;
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
        if (value && value[ 0 ] === '=')
          newConstruct[ name ] = this.assignment(value, construct);
        else
          newConstruct[ name ] = value;
      }

    // select
    if (this.options.select) {
      for (let name of this.options.select)
        if (hasOwnProperty(construct, name))
          newConstruct[ name ] = construct[ name ];
    }

    // map
    else if (this.options.map) {
      // JSON object with 'source': 'target' properties in dot notation
      dot.transform(this.options.map, construct, newConstruct);
    }

    else {
      // copy the entire construct
      Object.assign(newConstruct, construct);
    }

    // assign values
    if (this.options.assign) {
      for (let [ name, value ] of Object.entries(this.options.assign)) {
        if (value && value[ 0 ] === '=')
          newConstruct[ name ] = this.assignment(value, newConstruct);
        else if (hasOwnProperty(newConstruct, name) && hasOwnProperty(this.mutations, name))
          newConstruct[ name ] = this.mutations[ name ](newConstruct[ name ], newConstruct);
      }
    }

    // remove
    if (this.options.remove) {
      for (let name of this.options.remove)
        delete newConstruct[ name ];
    }

    // override
    if (this.options.override) {
      for (let [ name, value ] of Object.entries(this.options.override)) {
        if (value && value[ 0 ] === '=')
          newConstruct[ name ] = this.assignment(value, newConstruct);
        else
          newConstruct[ name ] = value;
      }
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