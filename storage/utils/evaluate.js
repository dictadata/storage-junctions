/**
 * storage/utils/evaluate.js
 */
"use strict";

const dot = require('./dot');

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
//   'string' | number | boolean | field-name[:padding] | field-name/regexp/replace[:padding]
//
// boolean
//   "true" | "false"
//
// field-name
//   name | dot-notation
//
// field-name/regexp/replace
//   field-name - a field that contains string value
//   regexp - regular expression
//   replace - replacement string using $ notation to insert capture groups
//
// padding
//   length,prefix[,suffix]
//
// length
//   desired length of string value
//
// prefix
//   prefix string for start padding, ignored if suffix specified
//
// suffix
//   suffix string for end padding
//
// notes:
//   An expression-value of a single field name results in underlying type, e.g. string, number, boolean.
//   Concatenation will result in a string if any exp-value results in a string.
//   Field-names cannot be "true", "false" or contain characters =+/:
//   Concatenating boolean values will have unexpected results.
//   Regular expressions cannot contain + characters use {1,} instead, e.g. .{1,} instead of .+
//   If using padding then regexp and replace values cannot contain character :
//
// example expressions
//   "literal"
//   "=fieldname"
//   "=prop.fieldname
//   "=fieldname+'literal'+..."
//   "='literal'+prop.fieldname+..."
//   "=fieldname/regexp/replacement"
//   "=fieldname:0,3
//   "=fieldname:,3,0"
//

module.exports = exports =
  /**
     * Get value from field(s) and/or literal values
     * @param {*} construct object to pick values from
     * @param {*} expression in the form "=[prop.]fieldname+'literal'+..."
     */
  function evaluate(expression, construct) {
    if (!expression || typeof expression != "string" || expression[ 0 ] !== '=')
      return expression;

    const parts = expression.substring(1, expression.length).split('+');
    let result = undefined;

    for (let part of parts) {
      let value;
      const [ p, padding ] = part.split(':');

      if (p && p[ 0 ] === "'") {
        // literal string
        value = p.substring(1, p.length - 1);
      }
      else if (isFinite(p)) {
        // number
        value = Number.parseFloat(p);
      }
      else if (p === "true" || (p === "false")) {
        // boolean
        value = (p === "true");
      }

      if (p.indexOf('/') > 0) {
        // regexp, e.g. =fieldname/regexp/replace
        let exp = p.split('/');
        if (exp.length === 3) {
          // get field value
          let fldval = dot.get(exp[ 0 ], construct);
          // create regexp
          let rx = RegExp(exp[ 1 ]);
          // run regexp on field value
          value = fldval.replace(rx, exp[ 2 ]);
        }
      }
      else {
        // field name
        value = dot.get(p, construct);
      }

      if (padding) {
        let args = padding.split(',');
        if (args.length === 3)
          value = value.padEnd(args[ 0 ], args[ 2 ]);
        else
          value = value.padStart(args[ 0 ], args[ 1 ]);
      }

      // concatenate values
      if (result === undefined)
        result = value;
      else
        result += value;
    }

    return result;
  };
