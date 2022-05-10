"use strict";

const { Transform } = require('stream');
const { typeOf, hasOwnProperty } = require("../utils");

const dot = require('dot-object');

// order of operations:
//   inject_before
//   select fields, mapping or copy
//   remove
//   inject_after

// example select transform
/*
  transform: {
    "select": {
      // inject new fields or set defaults in case of missing values
      inject_before: {
        "new-field-name": <value>
        "existing-field-name": <default value>
      },

      // select fields
      fields: ['field1', 'field2', ...],

      // or map fields using dot notation
      // { src: dest, ...}
      fields: {
        "field1": "Field1",
        "object1.subfield":  "FlatField"
      },

      // remove fields from the new construct
      remove: ["field1", "field2"],

      // inject new fields or override existing values
      inject_after: {
        "new-field-name": <value>,
        "existing-field-name": <override value>
      }

    }
  };
*/

module.exports = exports = class SelectTransform extends Transform {

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

    if (this.options.inject_before)
      for (let [ name, value ] of Object.entries(this.options.inject_before)) {
        if (value && value[ 0 ] === '=')
          newConstruct[ name ] = this.assignment(value, construct);
        else
          newConstruct[ name ] = value;
      }

    // this.options.fields
    if (Array.isArray(this.options.fields)) {
      // select fields
      for (let name of this.options.fields)
        if (hasOwnProperty(construct, name))
          newConstruct[ name ] = construct[ name ];
    }
    else if (typeOf(this.options.fields) === "object")
      // field mapping
      // JSON object with 'source': 'target' properties in dot notation
      dot.transform(this.options.fields, construct, newConstruct);
    else
      // copy the entire construct
      Object.assign(newConstruct, construct);

    if (this.options.remove)
      for (let fldname of this.options.remove)
        delete newConstruct[ fldname ];

    if (this.options.inject_after)
      for (let [ name, value ] of Object.entries(this.options.inject_after)) {
        if (value && value[ 0 ] === '=')
          newConstruct[ name ] = this.assignment(value, construct);
        else
          newConstruct[ name ] = value;
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
