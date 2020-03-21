"use strict";

const {StorageError} = require("./types");

/**
 * An field is a desciptor for a individual item of a construct.
 */
module.exports = exports = class Field {

  /**
   * Field class
   * @param {*} definition attributes of the field.
   * @param {*} _meta an array of meta fields to add to the encoding.
   */
  constructor(definition, _meta=null) {
    if (typeof definition === 'string') {
      definition = { name: definition, label: definition };
    }
    if (!(definition && definition.name))
      throw new StorageError({statusCode: 400}, "Invalid field definition");

    this.name = definition.name || '';
    this.type = definition.type || 'undefined';
    this.size = definition.size || 0;
    this.default = definition.default || null;
    this.isNullable = definition.nullable || true;
    this.isKey = definition.isKey || false;
    this.label = definition.label || definition.name || '';

    if (_meta) {
      for (let mf of _meta) {
        this["_meta." + mf] = null;
      }
    }
  }

  /**
   * Returns a encoding trace for the field.
   */
  toString() {
    return this.name + "|" + this.type + "|" + this.label + "|" + this.default + "|" + this.isNullable + "|" + this.isKey;
  }
};
