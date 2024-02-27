/**
 * storage/utils/evaluate.js
 */
"use strict";

const dot = require('dot-object');

module.exports = exports =
  /**
     * Get value from field(s) and/or literal values
     * @param {*} construct object to pick values from
     * @param {*} expression in the form "=[prop.]fieldname+'literal'+..."
     */
  function evaluate(expression, construct) {
    let result = "";

    let parts = expression.substr(1, expression.length - 1).split('+');
    for (let p of parts) {
      if (p && p[ 0 ] === "'")
        // literal string
        result += p.substr(1, p.length - 2);
      else
        // field in construct
        result += dot.pick(p, construct);
    }

    return result;
  };
