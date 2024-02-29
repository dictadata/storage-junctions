/**
 * storage/utils/evaluate.js
 */
"use strict";

const dot = require('dot-object');

// expression
//   literal
//   =expression-value
//
// literal
//   string value, without inner ' delimiter characters
//
// expression-value
//   exp-value
//   exp-value + exp-value + ...
//
// exp-value
//   field-name | 'string' | number | boolean | field-name/regexp/replace/
//
// field-name
//   name | dot-notation
//
// function
//   func(field, arg1, arg2)
//
// field-name/regexp/replace/
//   field-name a field that contains string values
//   regexp regular expression
//   replacement string using $n to insert capture groups
//
// notes:
//   An expression-value of a single field name results in underlying type, e.g. string, number, boolean.
//   Concatenation will result in a string if any exp-value results in a string.
//   Concatenating boolean values will have unexpected results.
//   Regular expressions can not contain + characters.
//

// example expressions
//   "literal"
//

module.exports = exports =
  /**
     * Get value from field(s) and/or literal values
     * @param {*} construct object to pick values from
     * @param {*} expression in the form "=[prop.]fieldname+'literal'+..."
     */
  function evaluate(expression, construct) {
    if (!expression || expression[ 0 ] !== '=')
      return expression;

    let parts = expression.substring(1, expression.length).split('+');
    let result = undefined;

    for (let p of parts) {
      let value;

      if (p && p[ 0 ] === "'") {
        // literal string
        value = p.substring(1, p.length - 1);
      }
      else if (Number.isFinite(p)) {
        // number
        value = Number.parseFloat(p);
      }
      else if (p === "true" || (p === "false")) {
        // boolean
        value = (p === "true");
      }
      else if (p.indexOf('/') > 0) {
        // regexp
        let exp = p.split('/');
        value = dot.pick(exp[ 0 ], construct);
        if (exp.length !== 3 || typeof value !== "string")
          value = p;
        else {
          let rx = new RegExp(exp[ 1 ]);
          let v2 = value.replace(rx, exp[ 2 ]);
          if (v2)
            value = v2;
        }
      }
      else {
        // field name
        value = dot.pick(p, construct);
      }

      if (typeof result === "undefined")
        result = value;
      else
        result += value;
    }

    return result;
  };
