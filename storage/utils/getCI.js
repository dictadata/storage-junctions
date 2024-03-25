// storage/utils/getCI
"use strict";

/**
 * get property with case-insensitive key
 * returns value of property of undefined if not found
 * @param {Object} object
 * @param {string} key
 * @return {any} value
 */
function getCI(object, key) {
  key = key.toUpperCase();
  let value = object[Object.keys(object).find(k => k.toUpperCase() === key)];
  return value;
}

module.exports = exports = getCI;
