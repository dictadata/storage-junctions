// storage/types/Field
"use strict";

const StorageError = require("./storage-error");

/**
 * An field is a descriptor for a property of a construct.
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
      throw new StorageError(400, "Invalid field definition");

    // required properties
    this.name = definition.name;
    this.type = 'unknown';

    // common properties
    //this.size = 0;
    //this.nullable = true;
    //this.default = null;
    //this.key = 0; // key ordinal position

    // additional properties
    //this.label = definition.name;
    //this.ordinal = 0;  // structure ordinal position
    //this.text = ""; ???
    //this._<model>  // source properties

    // shallow copy
    for (let [ prop, value ] of Object.entries(definition))
      if (typeof value !== "function")
        this[ prop ] = definition[ prop ];
  }

  get hasDefault() {
    return (typeof this.default !== "undefined");
  }
  get isNullable() {
    return (typeof this.nullable !== "undefined") ? this.nullable : true;
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
