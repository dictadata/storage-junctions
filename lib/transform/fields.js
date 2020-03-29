"use strict";

const { Transform } = require('stream');
const {StorageError} = require("../types");
const logger = require('../logger');

const dot = require('dot-object');

// order of operations:
//   inject_before
//   mapping (or copy)
//   remove
//   inject_after

// example fields transform
/*
  transform: {
    "fields": {
      // inject new fields or set defaults in case of missing values
      inject_before: {
        "newField": <value>
        "existingField": <default value>
      },

      // select and map fields using dot notation
      // { src: dest, ...}
      mapping: {
        "field1": "Field1",
        "object1.subfield":  "FlatField"
      },

      // remove fields from the new construct
      remove: ["field1", "field2"],

      // inject new fields or override existing values
      inject_after: {
        "newField": <value>,
        "existingField": <override value>
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
    let newConstruct = {};

    if (this.options.inject_before)
      Object.assign(newConstruct, this.options.inject_before);

    if (this.options.mapping)
      // JSON object with 'source': 'target' properties in dot notation
      dot.transform(this.options.mapping, construct, newConstruct);
    else
      // copy the entire construct
      Object.assign(newConstruct, construct);

    if (this.options.remove)
      for (let fldname of this.options.remove)
        delete newConstruct[fldname];

    if (this.options.inject_after)
      Object.assign(newConstruct, this.options.inject_after);

    callback(null, newConstruct);
  }

  /* optional */
  /*
  _flush(callback) {

    // push some final object(s)
    this.push({results: 'x'})
  }
  */

};
