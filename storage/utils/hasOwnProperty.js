// storage/utils/hasOwnProperty
"use strict";

/**
 * utility function for Object.hasOwnProperty
 * @param {Object} obj 
 * @param {String} propname 
 */
function hasOwnProperty (obj, propname) {
  return Object.prototype.hasOwnProperty.call(obj, propname);
}

module.exports = exports = hasOwnProperty;
