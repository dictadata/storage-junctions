// storage/utils/typeOf
"use strict";

/**
 * typeOf returns base type of objects like "string", "array", "date", "regexp"
 * or the object's constructor name
 * @param {any} obj the object to check
 * @param {Boolean} cname return for constructor.name for Objects
 */
function typeOf(obj, name = false) {

  // "[object BaseType]"
  let baseType = Object.prototype.toString.call(obj).slice(8, -1);

  if (name && baseType !== "Null") {
    let cname = obj?.constructor.name;
    return cname;
  }
  else {
    return baseType.toLowerCase();
  }

/*
  // use obj.prototype.toString() for deepType (handles all types)
  // "[object DeepType]"

  var deepType = Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  //console.log('deepType ' + deepType);

  if (deepType === 'generatorfunction') {
    return 'function';
  }

  if (deepType.endsWith('array') && deepType !== 'array')
    return 'typedarray';

  // Prevent over specificity (for example, [object HTMLDivElement], etc).
  // Account for functionish Regexp (Android <=2.3), functionish <object> element (Chrome <=57, Firefox <=52), etc.
  // String.prototype.match is universally supported.

  return deepType.match(/^(array|map|set|bigint|date|error|function|generator|regexp|symbol)$/) ? deepType :
    (typeof obj === 'object' || typeof obj === 'function') ? 'object' : typeof obj;
*/
};

module.exports = exports = typeOf;
