/**
 * storage/utils/match.js
 */
"use strict";

const typeOf = require("./typeOf");
const dot = require('dot-object');

/* example match expression
  // must match all criteria to return true
  {
    "field1": 'value',
    "field2": {
      gt: 100,
      lt: 200
    },
    "field3": ['value1','value2',...],
    "field4": /ab+c/i
  }
*/

/* operators
  'eq'     - field equal to value, same as "field1": 'value' criteria
  'neq'    - field not equal to value
  'lt'     - field less than value
  'lte'    - field less than or equal to value
  'gt'     - field greater than value
  'gte'    - field greater than or equal to value
  'wc'     - field matches a string value containing wildcard characters '?', '*'
  'exists' - field exists in construct, value is ignored
*/

/**
 * If criteria is a regexp, "/.../g", then create a RegExp
 * @param {String} criteria
 * @returns a RegExp or null
 */
function makeRegExp(criteria) {

  try {
    if (criteria instanceof RegExp)
      return criteria;

    if (typeOf(criteria) === "string" && criteria && criteria[ 0 ] === '/') {
      let l = criteria.lastIndexOf('/');
      if (l > 0) {
        let pattern = criteria.substring(1, l);
        let flags = criteria.substring(l + 1);
        let rx = new RegExp(pattern, flags);
        return rx;
      }
    }
  } catch (e) {
    // no op
  }

  return null;
}

/**
 * test str with a RegExp created from rule containing wildcard characters
 * @param {String} value - string to compare
 * @param {String} rule - string to compare against, may contain wildcard characters
 * @returns
 */
function wildcard(value, rule) {
  // remove anything that could interfere with regex
  rule = rule.replace(/([.+^=!:${}()|\[\]\/\\])/g, "\\$1");
  rule = rule.replace(/\?/g, ".");
  rule = rule.replace(/\*/g, ".*");
  let matched = new RegExp("^" + rule + "$").test(value);
  return matched;
}

module.exports = exports =
  /**
   *
   * @param {*} match - match expression
   * @param {*} construct - construct with fields to check against
   */
  function match(expression, construct) {
    if (typeOf(expression) !== "object")
      return false;
    let matched = true;

    // match all expressions
    for (let [ name, criteria ] of Object.entries(expression)) {
      let value = dot.pick(name, construct);
      let rx = makeRegExp(criteria); // could be null

      let exists = typeOf(value) !== "undefined";
      //let exists = hasOwnProperty(construct,name);

      if (Array.isArray(criteria)) {
        matched = exists && criteria.includes(value);
      }
      else if (rx) {
        matched = exists && rx.test(value);
      }
      else if (typeOf(criteria) === 'object') {
        // criteria(s) { op: value, ...}
        for (let [ op, opValue ] of Object.entries(criteria)) {
          switch (op) {
            case 'eq': matched = exists && (value == opValue); break;
            case 'neq': matched = !exists || (value != opValue); break;
            case 'lt': matched = exists && (value < opValue); break;
            case 'lte': matched = exists && (value <= opValue); break;
            case 'gt': matched = exists && (value > opValue); break;
            case 'gte': matched = exists && (value >= opValue); break;
            case 'wc': matched = exists && wildcard(value, opValue); break;
            case 'exists': matched = exists; break;
            default: break;  // ignore bad operators
          }
        }
      }
      else {
        // single property { field: value }
        matched = exists && (value == criteria);
      }

      // check short-circuit
      if (!matched)
        break;
    }

    return matched;
  };
