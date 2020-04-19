"use strict";

// storage types
//  "null"
//  "boolean"
//  "integer"
//  "float"
//  "keyword"
//  "text"
//  "date"
//  "uuid"
//  "binary"

const logger = require('./logger');
const ynBoolean = require('yn');

let maxKeywordLength = exports.maxKeywordLength = 64;
let maxKeywordValues = exports.maxKeywordValues = 1024;

/**
 * Try to parse the string into a javascript type.
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
 * The storage provider should determine the actual type, if possible.
 */
exports.storageType = function (value) {
  if (value === null)
    return "null";

  let jtype = typeof value;

  if (jtype === "boolean") {
    return "boolean";
  }
  else if (jtype === "number") {
    if (value % 1 === 0)
      return "integer";
    return "float";
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
      return "float";
    let b = ynBoolean(value);
    if (typeof b !== "undefined")
      return "boolean";
    if (value.length > 0 && value.length <= maxKeywordLength && !(/\s/g.test(value)))
      return "keyword";
    return "text";
  }
  else if (jtype === "object") {
    if (value === null)
      return "null";
    if (Array.isArray(value))
      return "fieldlist";  // array of objects
    if (value.constructor.name === "Date")
      return "date";
    return "fieldmap";  // object dictionary
  }

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
    return false;

  let inDate = true;
  let inTime = false;
  let numSeparators = 0;
  let separator = '';

  for (let i=0; i < value.length; i++) {
    // first character must be digit
    if (i===0 && !'0123456789'.includes(value[i]))
      return false;

    if (inDate) {
      // general date exclusion
      if (!'0123456789-/.T '.includes(value[i]))
        return false;
      // check separators
      if ('-/.'.includes(value[i])) {
        ++numSeparators;
        if (numSeparators == 1)
          separator = value[i];
        if (value[i] !== separator || numSeparators > 2)
          return false;
      }
      // check for date time separator
      if ('T '.includes(value[i])) {
        if (i < 8 || i > 10 || numSeparators < 2 || separator !== '-')
          return false;
        inDate = false;
        inTime = true;
      }
    }
    else if (inTime) {
      // general time check, javascript can't include a timezone offset
      if (!'0123456789:.-Z'.includes(value[i])) {
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

  //logger.debug("true");
  return true;
};

/**
 * return ISO data string, truncate time if zero
 * @param {*} value
 */
exports.formatDate = function (value) {
  if (typeof value === "string" && isDate(value)) {
    if (value.startsWith("0000"))  // a null/empty date, e.g. "0000-00-00 00:00:00"
      return "";
    value = new Date(value);
  }
  else if ((typeof value !== "object") || !(value instanceof Date))
    return "";

  let dt = value.toISOString();
  let includesTime = false;
  // check for zero time,  e.g. YYYY-MM-DDT00:00:00.000Z
  // find first [1-9] digit in the time field
  for (let i = 11; i < dt.length; i++) {
    if (dt[i] >= "1" && dt[i] <= "9") {
      includesTime = true;
      break;
    }
  }

  if (!includesTime)
    dt = dt.substr(0,10);  // return just the date

  return dt;
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
  constructor(info, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    this.name = 'StorageError';

    // StorageError information
    // user should be careful not to accidentially overwrite any standard Error properties
    Object.assign(this, {statusCode: 500}, info);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }

  }
}
exports.StorageError = StorageError;
