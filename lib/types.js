"use strict";

// storage types
//  "null"
//  "boolean"
//  "integer"
//  "float"
//  "keyword"
//  "text"
//  "date"
//  "binary"

const logger = require('./logger');
const ynBoolean = require('yn');

let maxKeywordLength = exports.maxKeywordLength = 32;
let maxKeywordValues = exports.maxKeywordValues = 128;

/**
 * Try to parse the string into a javascript type.
 * Returns the value as a javascript typed value.
 */
exports.parseValue = function (value) {

  if (!value || typeof value !== 'string')
    return value;

  let b = ynBoolean(value);
  if (b !== null)
    return b;

  if (isDate(value))
    return new Date(value);

  // integer check
  if (/^[-+]?(\d+)$/.test(value))
    return Number(value);

  // float check
  if (!isNaN(value) && !isNaN(parseFloat(value)))
    return Number(value);

  return value;
};

/**
 * Determine storage field type. Note, this is just a guess.
 * The storage provider should determine the actual type, if possible.
 */
exports.storageType = function (value) {
  let jtype = typeof value;

  if (jtype === "boolean") {
    return "boolean";
  } else if (jtype === "number") {
    if (value % 1 === 0)
      return "integer";
    return "float";
  } else if (jtype === "string") {
    if (value.length === 0)
      return "null";
    if (ynBoolean(value) !== null)
      return "boolean";
    if (isDate(value))
      return "date";
    if (value.length > 0 && value.length <= maxKeywordLength && !(/\s/g.test(value)))
      return "keyword";
    return "text";
  } else if (jtype === "object") {
    if (value === null)
      return "null";
    if (Array.isArray(value))
      return "array";
    if (value.constructor.name === "Date")
      return "date";
    return "object";
  }

  return jtype;
};

/**
 * Returns true if value is a local date, ISO date; time is optional
 * @param {*} value a string
 */
let isDate = exports.isDate = function(value) {
  logger.debug(value);
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
        logger.debug("bad time")
        return false;
      }
      // should do separator checks
      // should do timezone checks
    }
  }

  // post checks
  if (inDate && numSeparators < 2) {
    logger.debug("post")
    return false;
  }

  logger.debug("true");
  return true;
};

/**
 * Truncate time if zero, otherwise return ISO data string
 * @param {*} value
 */
exports.formatDate = function (value) {
  if ((typeof value !== "object") || !(value instanceof Date))
    return value;

  let dt = value.toISOString();
  let full = false;
  for (let i = 11; i < dt.length; i++) {
    if (dt[i] >= "1" && dt[i] <= "9") {
      full = true;
      break;
    }
  }
  if (!full)
    dt = dt.substr(0,10);
  return dt;
};

/**
 * The results type returned by storage methods. Note encoding methods return an Engram object.
 * @param {string} result a string with a textual result code
 * @param {*} data a StorageConstruct object or array of StorageConstructs, if any
 * @param {*} keys the key or keys used to recall, if the source has this capability
 * @param {*} _meta extra information from the storage source, if the source provides info
 */
function StorageResults (result, data = null, keys = null, _meta = null) {
  this.result = result;
  if (data)
    this.data = data;
  if (keys)
    this.keys = keys;
  if (_meta)
    this._meta = _meta;
}
exports.StorageResults = StorageResults;

exports.StorageConstruct = function (data, key = null, _meta = null) {
  this.data = data;
  if (key)
    this.key = key;
  if (_meta)
    this._meta = _meta;
};

class StorageError extends Error {
  constructor(info, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StorageError);
    }

    this.name = 'StorageError';

    // Storage debugging information
    if (!info) info = {};
    if (!info.statusCode) info.statusCode = 500;
    Object.assign(this, info);
    //this.date = new Date();
  }
}
exports.StorageError = StorageError;
