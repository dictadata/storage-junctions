// storage/types/storageType
"use strict";

const { typeOf, isDate, isUUID } = require("../utils");
const stringBreakpoints = require("./stringBreakpoints");
const ynBoolean = require('yn');

/**
 * Determine storage field type. Note, this is just a guess.
 * The storage source should provide the actual type, but not always possible.
 */
function storageType (value) {
  if (value === null)
    return "null";

  let jtype = typeOf(value);

  if (jtype === "number") {
    if (value % 1 === 0)
      return "integer";
    return "number";
  }
  else if (jtype === "string") {
    //if (value.length === 0)
    //  return "null";
    if (isDate(value))
      return "date";
    if (isUUID(value))
      return "uuid";
    if (/^[-+]?(\d+)$/.test(value))
      return "integer";
    if (!isNaN(value) && !isNaN(parseFloat(value)))
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
};

module.exports = exports = storageType;
