"use strict";

// storage types
//  "null"
//  "boolean"
//  "integer"
//  "number"
//  "keyword"
//  "text" | "string"
//  "date"
//  "uuid"
//  "binary"

const logger = require('./logger');
const ynBoolean = require('yn');

/**
 * Three "types" of strings: keyword, string, blobText
 *    keywords   - short strings that may be used as index values
 *    short text - used for titles, descriptions, etc. may be full-text indexed
 *    long text  - large strings for documents, articles, etc.
 */
const stringBreakpoints = exports.stringBreakpoints = {
  keyword: 64,
  text: 4000
  // otherwise long text
};

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

/**
 * utility function for Object.hasOwnProperty
 * @param {Object} obj 
 * @param {String} propname 
 */
let hasOwnProperty = exports.hasOwnProperty = function (obj, propname) {
  return Object.prototype.hasOwnProperty.call(obj, propname);
}

/**
 * Try to parse a string value into a javascript type.
 * Returns the value as a javascript typed value.
 */
exports.parseValue = function (value) {

  if (!value || typeof value !== 'string')
    return value;

  if (isDate(value))
    return new Date(value);

  // integer check
  if (/^[-+]?(\d+)$/.test(value))
    return Number(value);

  // float check
  if (!isNaN(value) && !isNaN(parseFloat(value)))
    return Number(value);

  let b = ynBoolean(value);
  if (typeof b !== "undefined")
    return b;

  return value;
};

/**
 * Determine storage field type. Note, this is just a guess.
 * The storage source should provide the actual type, but not always possible.
 */
exports.storageType = function (value) {
  if (value === null)
    return "null";

  let jtype = typeOf(value);

  if (jtype === "number") {
    if (value % 1 === 0)
      return "integer";
    return "number";
  }
  else if (jtype === "string") {
    //if (value.length === 0)
    //  return "null";
    if (isDate(value))
      return "date";
    if (isUUID(value))
      return "uuid";
    if (/^[-+]?(\d+)$/.test(value))
      return "integer";
    if (!isNaN(value) && !isNaN(parseFloat(value)))
      return "number";
    let b = ynBoolean(value);
    if (typeof b !== "undefined")
      return "boolean";
    if (value.length > 0 && value.length <= stringBreakpoints.keyword && !(/\s/g.test(value)))
      return "keyword";
    return "text";
  }
  else if (jtype === "array") {
    return "list";  // array of items
  }
  else if (jtype === "object") {
    return "map";  // nested object
  }
/*    
  else if (jtype === "boolean") {
    return "boolean";
  }
  else if (jtype === "date") {
    return "date";
  }
  // could be other types like function, regex, or classes  
*/
  
  return jtype;
};

/**
 * Returns true if value is a valid string form of a UUID
 * @param {*} value a string
 */
let isUUID = exports.isUUID = function(value) {
  if (!value || typeof value !== "string")
    return false;

  var validLen = [36,32,38,40];
  if (!validLen.includes(value.length))
    return false;

  // normal 8-4-4-4-12
  if (/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/.test(value))
    return true;
  // without dashes
  if (/[0-9a-fA-F]{32}/.test(value))
    return true;
  // old microsoft style with {} braces
  if (/\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}/.test(value))
    return true;
  // SHA-1 digest
  if (/[0-9a-fA-F]{40}/.test(value))
    return true;

  return false;
};

/**
 * Returns true if value is a local date, ISO date; time is optional
 * @param {*} value a string
 */
let isDate = exports.isDate = function(value) {
  //logger.debug(value);
  if (typeof value !== "string" || value.length < 8)
    return false;  // invalid date

  let inDate = true;
  let inTime = false;
  let numSeparators = 0;
  let separator = '';
  let parts = [];

  // check Oracle date "DD-MON-YY" or "DD-MON-YY HH:MI:SS"
  if (/^\d{2}-[A-Za-z]{3}-\d{2}$/.test(value) ||
    /^\d{2}-[A-Za-z]{3}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value))
    return 3;
  
  let part = "";
  for (let i = 0; i < value.length; i++) {
    // first character must be digit
    if (i === 0 && !'0123456789'.includes(value[i]))
      return false;  // is non-numeric

    if (inDate) {
      if ('0123456789'.includes(value[i])) {
        part += value[i];
      }
      else if ('-/.'.includes(value[i])) {
        // separator
        ++numSeparators;
        if (numSeparators == 1)
          separator = value[i];
        if (value[i] !== separator || numSeparators > 2)
          return false;
        parts.push(part);
        part = "";
      }
      else if ('T '.includes(value[i])) {
        // date time separator
        if (i < 8 || i > 10 || numSeparators !== 2)
          return false;
        if (separator !== '-' || parts[0].length < 4)
          return 2;
        inDate = false;
        inTime = true;
      }
      else
        return false;  // contains non-numeric
    }
    else if (inTime) {
      if ('+-0123456789'.includes(value[i])) { 
        part += value[i];
      }
      else if (':.Z'.includes(value[i])) {
        // separator
        parts.push(part);
        part = "";
      }
      else {
        logger.debug("bad time");
        return false;
      }
      // should do separator checks
      // should do timezone checks
    }
  }

  // post checks
  if (inDate && numSeparators < 2) {
    //logger.debug("post")
    return false;
  }

  if (separator !== '-' || parts[0].length < 4)
    return 2;  // non-ISO date string
  
  return 1;  // ISO compatiable date string
};


/**
 * The results type returned by storage methods. Note encoding methods return an Engram object.
 * @param {string} result a string with a textual result code
 * @param {*} data a raw data object or array of data objects
 * @param {*} key the key or array of keys, for keystores storage sources
 * @param {*} _meta extra information from the storage source, if the source provides info
 */
function StorageResults (result, data = null, key = null, _meta = null) {
  this.result = result;

  if (key) {
    this.data = {};
    if (typeof key === "string")
      this.data[key] = data;
  }
  else if (data) {
    this.data = Array.isArray(data) ? data : [data];
  }
  else
    this.data = [];
  if (_meta)
    this._meta = _meta;
}

StorageResults.prototype.add = function (data, key = null, _meta = null) {
  if (key) {
    if (!this.data)
      this.data = {};
    this.data[key] = data;
  }
  else {
    if (Array.isArray(data))
      this.data = data;
    else {
      if (!this.data)
        this.data = [];
      this.data.push(data);
    }
  }

  if (!_meta)
    this._meta = _meta;
  else if (key)
    this._meta[key] = _meta;
  else if (this._meta.data)
    this._meta.data.push(_meta);
};
exports.StorageResults = StorageResults;


class StorageError extends Error {
  constructor(status, ...params) {
    // Pass normal error arguments to parent constructor
    super(...params);

    this.name = 'StorageError';

    // StorageError status information
    if (typeof status === "number")
      this.statusCode = status;
    else if (typeOf(status) === "object")
      Object.assign(this, {statusCode: 500}, status);  // caller should be careful not to accidentially overwrite any standard Error properties

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }

  }
}
exports.StorageError = StorageError;
