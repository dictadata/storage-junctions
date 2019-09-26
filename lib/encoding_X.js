"use strict";

var Field = require('./field');
const StorageError = require("./storage_error");

/**
 * An encoding is a descriptor of the construct(s) that are maintained in a particular storage memory.
 */
module.exports = class Encoding {

  /**
   *
   */
  constructor() {
    // map of field objects
    // note: V8 engine should keep properties ordered in order of insertion
    this.fields = {};

  }

  dull() {
    this.fields = {};
  }

  /**
   *
   * @param {*} field
   * @param {*} check
   */
  add(field) {
    if (!(field instanceof Field))
      field = new Field(field);
    if (!(field && field.name))
      throw new StorageError({statusCode: 400}, "Invalid field definition");

    this.fields[field.name] = field;

    return field;
  }

  /**
   *
   * @param {*} fields encoding object or fields array
   */
  merge(encoding_fields) {
    let srcFields = encoding_fields.fields || encoding_fields;  // code do some more type checking

    Object.assign(this.fields, srcFields);
  }

};
