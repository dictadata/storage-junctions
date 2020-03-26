"use strict";

const { Transform } = require('stream');
const {StorageError} = require("../types");
const logger = require('../logger');

const dot = require('dot-object');

// example fields transform
/*
  transform: {
    "fields": {
      // add new fields to the construct
      inject: {
        "new field": "My New Object"
      },
      inject_before: true,
      //inject_after: true,  // default

      // select and map fields
      // src: dest
      // using dot notation
      mapping: {
        "field1": "field1",
        "object1.fieldx":  "fieldsx"
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

    if ( !(this.options.inject_before || this.options.inject_after) )
      this.options.inject_after = true;
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
      Object.assign(newConstruct, this.options.inject);

    if (this.options.mapping)   // JSON object with 'source': 'target' properties in dot notation
      dot.transform(this.options.mapping, construct, newConstruct);
    else
      Object.assign(newConstruct, construct);

    if (this.options.inject_after)
      Object.assign(newConstruct, this.options.inject);

    this.push(newConstruct);

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
