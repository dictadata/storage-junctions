// storage/utils/objCopy
"use strict";

const { typeOf } = require("../utils");

/**
 * Copy/replace source properties in target object.
 * Deep copy of object properties and top level arrays.
 * Shallow copy of reference types like Date, sub-arrays, etc.
 * Objects and arrays will be replaced not merged!
 * Does not copy functions.
 * Note, this is a recursive function.
 * @param {Object} target
 * @param {Object} source
 */
function objCopy(target, ...source) {

  for (const src of source) {
    for (let [ key, value ] of Object.entries(src)) {
      let srcType = typeOf(value);

      if (srcType === "object") {
        target[ key ] = {};  // replace
        objCopy(target[ key ], value);
      }
      else if ([ "date", "regexp" ].includes(srcType)) {
        target[ key ] = value;
      }
      else if (srcType === "array") {
        target[ key ] = new Array();  // replace
        for (let item of value)
          if (item != null && typeof item === "object")
            target[ key ].push(objCopy({}, item));
          else
            target[ key ].push(item);
      }
      else if (srcType === "map") {
        target[ key ] = new Map();  // replace
        for (let [ name, item ] of value.entries())
          if (item != null && typeof item === "object")
            target[ key ].set(name, objCopy({}, item));
          else
            target[ key ].set(name, item);
      }
      else if (srcType === "set") {
        target[ key ] = new Set();  // replace
        for (let item of value.entries())
          if (item != null && typeof item === "object")
            target[ key ].add(objCopy({}, item));
          else
            target[ key ].add(item);
      }
      else if (srcType !== "function") {
        target[ key ] = value;
      }
    }
  }

  return target;
}

module.exports = exports = objCopy;
