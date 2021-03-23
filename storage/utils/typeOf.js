// storage/utils/typeOf
"use strict";

/**
 * typeOf returns deep type of objects like "array", "date", "regex", ...
 * @param {*} obj - the object to check
 * @param {*} fullClass - if true return format is "[object <Type>]"
 */
let typeOf = exports.typeOf = function (obj, fullClass=false) {
  // get toPrototypeString() of obj (handles all types)
  // Early JS environments return '[object Object]' for null, so it's best to directly check for it.
  if (fullClass) {
    return (obj === null) ? '[object Null]' : Object.prototype.toString.call(obj);
  }

  if (obj == null) { return (obj + '').toLowerCase(); } // implicit toString() conversion

  var deepType = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  if (deepType === 'generatorfunction') { return 'function' }

  // Prevent overspecificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.

  return deepType.match(/^(array|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType :
    (typeof obj === 'object' || typeof obj === 'function') ? 'object' : typeof obj;
}

module.exports = exports = typeOf;
