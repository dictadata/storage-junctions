"use strict";

const {StorageError} = require("./types");

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
      definition = { name: definition, label: definition };
    }
    if (!(definition && definition.name))
      throw new StorageError({statusCode: 400}, "Invalid field definition");

    // set defaults
    this.name = definition.name;
    this.type = 'undefined';
    this.size = 0;
    this.default = null;
    this.isNullable = true;
    this.keyOrdinal = 0;
    this.label = definition.name;

    // shallow copy
    for (let [prop,value] of Object.entries(definition))
      if (typeof value !== "function")
        this[prop] = definition[prop];
  }

  get isKey() {
    return (this.keyOrdinal > 0);
  }
  /**
   * Returns a encoding trace for the field.
   */
  toString() {
    return JSON.stringify(this);
  }
};
