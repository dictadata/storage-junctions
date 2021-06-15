// storage/types/Field
"use strict";

const StorageError = require("./storage-error");

/**
 * An field is a desciptor for a individual item of a construct.
 */
module.exports = exports = class Field {

  /**
   * Field class
   * @param {*} definition attributes of the field.
   */
  constructor(definition) {
    if (typeof definition === 'string') {
      definition = { name: definition };
    }
    if (!(definition && definition.name))
      throw new StorageError( 400, "Invalid field definition");

    // set defaults
    this.name = definition.name;
    this.type = 'unknown';
    //this.size = 0;
    //this.nullable = true;
    //this.default = null;
    //this.key = 0; // key ordinal position

    //this.ordinal = 0;  // structure ordinal position
    //this.label = definition.name;
    //this.text = "";

    // shallow copy
    for (let [prop,value] of Object.entries(definition))
      if (typeof value !== "function")
        this[prop] = definition[prop];
  }

  get defaultValue() {
    return (typeof this.default !== "undefined") ? this.default : null;
  }
  set defaultValue(value) {
    if (typeof value !== "undefined")
      this.default = value;
  }

  get isNullable() {
    return (typeof this.nullable !== "undefined") ? this.nullable : true;
  }
  set isNullable(value) {
    this.nullable = value ? true : false;
  }

  get isKey() {
    return (this.key > 0);
  }
  set isKey(value) {
    this.key = value ? 1 : 0;
  }

  /**
   * Returns a encoding trace for the field.
   */
  toString() {
    return JSON.stringify(this);
  }
};
