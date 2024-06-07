// storage/types/storageType
"use strict";

const { typeOf, isDate, isUUID, ynBoolean } = require('@dictadata/storage-lib/utils');
const stringBreakpoints = require('./stringBreakpoints');


/**
 * Determine storage field type. Note, this is just a guess.
 * The storage source should provide the actual type, but not always possible.
 */
function storageType (value) {
  if (typeof value === "undefined" || value === null)
    return "unknown";

  let jtype = typeOf(value);

  if (jtype === "number") {
    if (value % 1 === 0)
      return "integer";
    return "number";
  }
  else if (jtype === "string") {
    //if (value.length === 0)
    //  return "unknown";

    if (isDate(value))
      return "date";

    if (isUUID(value))
      return "uuid";

    // test for integer; optional delimiters
    if (/^\s*[-+]?(\d{1,3}(?:,?\d{3})*)?\s*$/.test(value))
      return "integer";

    // if (!isNaN(value) && !isNaN(parseFloat(value)))
    // test for number or currency; optional delimiters
    if (/^\s*[-+]?(\d{1,3}(?:,?\d{3})*(?:\.\d*)?|\.\d*)?\s*$/.test(value) ||
      /^\s*\(?(\$?\d{1,3}(?:,?\d{3})*(?:\.\d{2})?|\.\d{2})?\)?\s*$/.test(value))
      return "number";

    let b = ynBoolean(value);
    if (typeof b !== "undefined")
      return "boolean";

    if (value.length > 0 && value.length <= stringBreakpoints.keyword && !(/\s/g.test(value)))
      return "keyword";

    return "text";
  }
  else if (jtype === "array") {
    return "list";  // array of items
  }
  else if (jtype === "object") {
    return "map";  // nested object
  }
  /*
  else if (jtype === "boolean") {
    return "boolean";
  }
  else if (jtype === "date") {
    return "date";
  }
  // could be other types like function, regex, or classes
  */

  return jtype;
}

module.exports = exports = storageType;
