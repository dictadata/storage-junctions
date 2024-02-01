// storage/utils/objCopy
"use strict";

const { typeOf, hasOwnProperty } = require("../utils");

/**
 * Copy/replace source properties in target object.
 * Deep copy of object properties.
 * Shallow copy of reference types date, regexp.
 * Arrays, map, sets will be replaced not merged!
 * Functions will not be copied.
 * Note, this is a recursive function.
 * @param {Object} target destination target object
 * @param {Object} source one or more source objects
 */
function objCopy(target, ...source) {

  for (const src of source) {
    for (let [ key, value ] of Object.entries(src)) {
      let srcType = typeOf(value);

      if (srcType === "object") {
        if (!hasOwnProperty(target, key) || typeOf(target[key]) !== "object")
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
