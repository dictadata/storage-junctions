// storage/types/parseValue
"use strict";

const isDate = require('../utils/isDate');
const ynBoolean = require('yn');

/**
 * Try to parse a string value into a javascript type.
 * Returns the value as a javascript typed value.
 */
function parseValue(value) {

  if (!value || typeof value !== 'string')
    return value;

  if (isDate(value))
    return new Date(value);

  // integer check
  if (/^[-+]?(\d+)$/.test(value))
    return Number(value);

  // float check
  if (!isNaN(value) && !isNaN(parseFloat(value)))
    return Number(value);

  let b = ynBoolean(value);
  if (typeof b !== "undefined")
    return b;

  return value;
}

module.exports = exports = parseValue;
