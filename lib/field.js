"use strict";

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

    this.name = definition && definition.name || '';
    this.type = definition && definition.type || 'undefined';
    this.label = definition && definition.label || '';
    this.default = definition && definition.default || null;
  }

  /**
   * Returns a encoding trace for the field.
   */
  toString() {
    return this.name + "|" + this.type + "|" + this.label + "|" + this.default;
  }
};
