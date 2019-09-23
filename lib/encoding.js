"use strict";

var Engram = require('./engram');
var Field = require('./field');

/**
 * An encoding is a descriptor of the construct(s) that are maintained in a particular storage memory.
 */
module.exports = class Encoding extends Engram {

  /**
   *
   * @param {*} storagePath is an SMT string or Engram
   */
  constructor(storagePath) {
    super(storagePath);

    // map of field objects
    // assuming that V8 engine keeps properties ordered in order of insertion
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
      throw new Error("Invalid field definition");

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
