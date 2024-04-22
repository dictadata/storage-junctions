// storage/utils/hasOwnProperty
"use strict";

///// DEPRECATED use Object.hasOwn(obj, prop)

/**
 * utility function for Object.hasOwnProperty
 * @param {object} obj
 * @param {string} propname
 */
function hasOwnProperty(obj, propname) {
  if (obj)
    throw "hasOwnProperty DEPRECATED";

  if (!obj || !propname) return false;
  return Object.prototype.hasOwnProperty.call(obj, propname);
}

module.exports = exports = hasOwnProperty;
