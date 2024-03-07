// storage/utils/hasOwnProperty
"use strict";

///// DEPRECATED use Object.hasOwn(obj, prop)

/**
 * utility function for Object.hasOwnProperty
 * @param {Object} obj
 * @param {String} propname
 */
function hasOwnProperty(obj, propname) {
  if (obj)
    throw "hasOwnProperty DEPRECATED";

  if (!obj || !propname) return false;
  return Object.prototype.hasOwnProperty.call(obj, propname);
}

module.exports = exports = hasOwnProperty;
