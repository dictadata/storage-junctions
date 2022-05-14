"use strict";

const { parseValue, StorageError } = require("../../types");
const { typeOf, hasOwnProperty } = require("../../utils");
const dot = require('dot-object');
const ynBoolean = require('yn');

module.exports = exports = class StorageEncoder {

  /**
   *
   * @param {*} storageJunction
   * @param {*} options
   */
  constructor(storageJunction, options) {
    if (!hasOwnProperty(storageJunction, "engram"))
      throw new StorageError(400, "Invalid parameter: storageJunction");

    this.junction = storageJunction;
    this.smt = storageJunction.smt;
    this.engram = storageJunction.engram;

    this.options = Object.assign({}, options);
  }

  /**
   * Convert values to types defined in the storage encoding.
   * @param {Object} construct
   */
  cast(construct) {
    if (typeOf(construct) !== "object")
      return construct;

    var encoding = this.engram;

    for (let [ name, value ] of Object.entries(construct)) {
      let field = encoding.find(name);
      let newValue = value;

      if (value === "" || value === null) {     // current parser generates "" instead of null
        newValue = field.defaultValue;
      }
      else if (field.type === 'boolean') {
        newValue = ynBoolean(value);
        if (typeof newValue === "undefined") newValue = field.defaultValue;
      }
      else if (field.type === 'integer') {
        newValue = Number.parseInt(value, 10);
        if (Number.isNaN(newValue)) newValue = field.defaultValue;
      }
      else if (field.type === 'float') {
        newValue = Number.parseFloat(value);
        if (!Number.isFinite(newValue)) newValue = field.defaultValue;
      }
      else if (field.type === 'date') {
        newValue = new Date(value);
        if (isNaN(newValue)) newValue = field.defaultValue;
      }
      else if (field.type === 'keyword') {
        if (value === null) newValue = field.defaultValue;
      }
      else if (field.type === 'text') {
        if (value === null) newValue = field.defaultValue;
      }
      else {
        newValue = parseValue(value);
      }

      if (newValue !== value)
        construct[ name ] = newValue;
    }

    return construct;
  }

  /**
   * Select fields to include in the output.
   * Logic is the same as the fields clause of Select transform.
   * @param {Object} construct
   * @returns
   */
  select(construct) {
    if (typeOf(construct) !== "object")
      return construct;

    let newConstruct = {};

    // this.options.fields
    if (Array.isArray(this.options.fields)) {
      // select fields
      for (let name of this.options.fields)
        if (hasOwnProperty(construct, name))
          newConstruct[ name ] = construct[ name ];
    }
    else if (typeOf(this.options.fields) === "object")
      // field mapping
      // JSON object with 'source': 'target' properties in dot notation
      dot.transform(this.options.fields, construct, newConstruct);
    else
      // copy the entire construct
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
    if (typeOf(construct) !== "object")
      return construct;

    const match = this.options.match || {};
    let forward = true;

    // do some match filterin'
    // match all expessions to forward
    for (let [ fldname, criteria ] of Object.entries(match)) {
      let cvalue = dot.pick(fldname, construct);
      let exists = typeof (cvalue) !== "undefined";
      //let exists = hasOwnProperty(construct,fldname);

      if (Array.isArray(criteria)) {
        forward = exists && criteria.includes(cvalue);
      }
      else if (criteria instanceof RegExp) {
        forward = exists && criteria.test(cvalue);
      }
      else if (typeOf(criteria) === 'object') {
        // expression(s) { op: value, ...}
        for (let [ op, value ] of Object.entries(criteria)) {
          switch (op) {
            case 'eq': forward = exists && (cvalue === value); break;
            case 'neq': forward = !exists || (cvalue !== value); break;
            case 'lt': forward = exists && (cvalue < value); break;
            case 'lte': forward = exists && (cvalue <= value); break;
            case 'gt': forward = exists && (cvalue > value); break;
            case 'gte': forward = exists && (cvalue >= value); break;
            case 'wc': forward = exists && this.wildcardTest(cvalue, value); break;
            case 'exists': forward = exists; break;
            default: break;  // ignore bad operators
          }
        }
      }
      else {
        // single property { field: value }
        forward = exists && (cvalue === criteria);
      }

      // check short-circuit
      if (!forward)
        break;
    }

    return forward ? construct : null;
  }

  /**
   * Test if str matches the regex rule.
   * @param {string} str string to test
   * @param {string} rule regex expression
   * @returns
   */
  wildcardTest(str, rule) {
    // remove anything that could interfere with regex
    rule = rule.replace(/([.+^=!:${}()|\[\]\/\\])/g, "\\$1");
    rule = rule.split("?").join(".");
    rule = rule.split("*").join(".*");

    let result = new RegExp("^" + rule + "$").test(str);
    return result;
  }

};