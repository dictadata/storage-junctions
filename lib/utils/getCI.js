"use strict";

/**
 * get property with case-insensitive key
 * @param {Object} object 
 * @param {string} key 
 * @return {any} value
 */
function getCI(object, key) {
  key = key.toUpperCase();
  let o = object[Object.keys(object).find(k =>
    k.toUpperCase() === key
  )];
  return o;
}

module.exports = exports = getCI;
