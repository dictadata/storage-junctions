// storage/utils/typeOf
"use strict";

/**
 * typeOf returns deep type of objects like "array", "date", "regex", ...
 * @param {*} obj - the object to check
 * @param {*} fullClass - if true return format is "[object <Type>]"
 */
let typeOf = exports.typeOf = function (obj, fullClass = false) {
  // use obj.prototype.toString() for deepType (handles all types)

  if (fullClass) {
    // return type as "[object deepType]" format
    // Note, early JS environments return '[object Object]' for null.
    return (obj === null) ? '[object Null]' : Object.prototype.toString.call(obj);
  }

  // really old bug in Javascript that where typeof null returns 'object'
  if (obj == null) {                  // null or undefined
    return (obj + '').toLowerCase(); // implicit toString() conversion
  }

  var deepType = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  //console.log('deepType ' + deepType);

  if (deepType === 'generatorfunction') {
    return 'function';
  }

  if (deepType.endsWith('array') && deepType !== 'array')
    return 'typedarray';

  // Prevent overspecificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.

  return deepType.match(/^(array|map|set|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType :
    (typeof obj === 'object' || typeof obj === 'function') ? 'object' : typeof obj;
};

module.exports = exports = typeOf;
