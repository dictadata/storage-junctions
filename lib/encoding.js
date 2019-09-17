"use strict";

var Engram = require('./engram');

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
    this.fields = [];   // array of field objects
  }

  dull() {
    this.fields = [];
  }

  /**
   *
   * @param {*} field
   * @param {*} check
   */
  add(field,check=false) {
    if (check) {
      for (var i = 0; i < this.fields.length; i++) {
        if (this.fields[i].name === field.name) {
          this.fields[i] = field;
          return;
        }
      }
    }
    // append a new field
    this.fields.push(field);
  }

  /**
   *
   * @param {*} name
   */
  find(name) {
    for (var i = 0; i < this.fields.length; i++) {
      if (this.fields[i].name === name)
        return this.fields[i];
    }
    return null;
  }

  /**
   *
   * @param {*} encoding_fields encoding object or fields array
   */
  merge(encoding_fields) {
    let srcFields = encoding_fields.fields || encoding_fields;  // code do some type checking

    for (let i = 0; i < srcFields.length; i++) {
      let field = srcFields[i];
      let index = this.fields.findIndex(element => {
        return element.name === field.name;
      });
      if (index >= 0)
        this.fields[index] = field;
      else
        this.fields.push(field);
    }
  }

};
