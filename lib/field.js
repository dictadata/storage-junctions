"use strict";

const StorageError = require("./storage_error");

/**
 * An field is a desciptor for a individual item of a construct.
 */
module.exports = class Field {

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

    this.name = definition.name || '';
    this.type = definition.type || 'undefined';
    this.size = definition.size || 0;
    this.default = definition.default || null;
    this.isNullable = definition.nullable || true;
    this.isKey = definition.isKey || false;
    this.label = definition.label || definition.name || '';
  }

  /**
   * Returns a encoding trace for the field.
   */
  toString() {
    return this.name + "|" + this.type + "|" + this.label + "|" + this.default + "|" + this.isNullable + "|" + this.isKey;
  }
};
