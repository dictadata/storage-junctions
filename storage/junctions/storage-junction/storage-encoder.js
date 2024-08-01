/**
 * storage/junctions/storage-junction/storage-encoder.js
 *
 */
"use strict";

const { StorageError } = require('../../types');
const { typeOf, isDate, isBoolean, dot, match } = require('@dictadata/lib');

module.exports = exports = class StorageEncoder {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    if (!Object.hasOwn(storageJunction, "engram"))
      throw new StorageError(400, "Invalid parameter: storageJunction");

    this.junction = storageJunction;
    this.smt = storageJunction.smt;
    this.engram = storageJunction.engram;

    this.options = Object.assign({}, options);
    this.missingValue = Object.hasOwn(this.options, "missingValue") ? this.options.missingValue : "";
  }

  /**
   * Convert string values to types defined in the storage encoding.
   * @param {object} construct
   */
  cast(construct) {
    if (this.options.raw || typeOf(construct) !== "object")
      return construct;

    var encoding = this.engram;

    for (let [ name, value ] of Object.entries(construct)) {
      let field = encoding.find(name);
      let newValue = value;

      if (value === undefined || value === null || value === this.missingValue) {
        newValue = field.default || null;
      }
      else if (field.type === 'boolean') {
        newValue = isBoolean(value);
        if (newValue === undefined)
          newValue = field.default;
      }
      else if (field.type === 'integer') {
        if (typeof value === "string")
          newValue = Number(value.replace(/[\,]/g, '')); // optional delimiters
        if (Number.isNaN(newValue))
          newValue = field.default;
      }
      else if (field.type === 'number') {
        if (typeof value === "string")
          newValue = Number(value.replace(/[\,]/g, '')); // optional delimiters
        if (!Number.isFinite(newValue))
          // check currency with optional delimiters
          newValue = Number(value.replace(/\(/, '-').replace(/[\$\(\,\)]/g, ''));
        if (!Number.isFinite(newValue))
          newValue = field.default;
      }
      else if (field.type === 'date') {
        newValue = new Date(value);
        if (isNaN(newValue))
          newValue = field.default;
      }
      else if (field.type === 'keyword') {
        if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean")
          newValue = value.toString();
        if (newValue === undefined || newValue === null)
          newValue = field.default;
      }
      else if (field.type === 'text') {
        if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean")
          newValue = value.toString();
        if (newValue === undefined || newValue === null)
          newValue = field.default;
      }
      else /* unknown */ {
        newValue = this.parseValue(value);
      }

      if (newValue !== value)
        construct[ name ] = newValue;
    }

    return construct;
  }

  /**
  * Try to parse a string value into a javascript type.
  * Returns the value as a javascript typed value.
  */
  parseValue(value) {

    if (!value || typeof value !== 'string')
      return value;

    if (isDate(value))
      return new Date(value);

    // test for integer; optional delimiters
    if (/^\s*[-+]?(\d{1,3}(?:,?\d{3})*)?\s*$/.test(value))
      return Number(value.replace(/[\,]/g, ''));

    // test for number; optional delimiters
    if (/^\s*[-+]?(\d{1,3}(?:,?\d{3})*(?:\.\d*)?|\.\d*)?\s*$/.test(value))
      return Number(value.replace(/[\,]/g, ''));

    // test for currency; optional delimiters
    if (/^\s*\(?(\$?\d{1,3}(?:,?\d{3})*(?:\.\d{2})?|\.\d{2})?\)?\s*$/.test(value))
      return Number(value.replace(/[\$\(,\)]/g, ''));

    let b = isBoolean(value);
    if (typeof b !== "undefined")
      return b;

    return value;
  }

  /**
   * Select fields to include in the output.
   * Logic is the same as the fields clause of Mutate transform.
   * @param {object} construct
   * @returns
   */
  select(construct) {
    if (!this.options?.pattern || typeOf(construct) !== "object")
      return construct;

    const pattern = this.options.pattern || {};
    let newConstruct = {};

    // pattern.fields
    if (Array.isArray(pattern.fields)) {
      // select fields
      for (let name of pattern.fields)
        if (Object.hasOwn(construct, name))
          newConstruct[ name ] = construct[ name ];
    }
    else if (typeOf(pattern.fields) === "object") {
      // field mapping
      // JSON object with 'source': 'target' properties in dot notation
      //dot.transform(pattern.fields, construct, newConstruct);
    }
    else
      // return construct
      newConstruct = construct;

    return newConstruct;
  }

  /**
   * Determine if construct should be included in output.
   * Logic is the same as the match clause of Filter transform.
   * @param {*} construct
   * @returns
   */
  filter(construct) {
    if (!this.options?.pattern || typeOf(construct) !== "object")
      return construct;

    const pattern = this.options.pattern || {};

    // do some match filterin'
    let matched = true;
    if (pattern.match)
      matched = match(pattern.match, construct);
    if (matched && pattern.drop)
      matched = !match(pattern.drop, construct);

    return matched ? construct : null;
  }

};
