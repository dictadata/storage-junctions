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

const ynBoolean = require('yn');

class Types {

  /**
   * Determine storage field type. Note, this is just a guess.
   * The storage provider should determine the actual type, if possible.
   */
  static storageType(value) {
    let jtype = typeof value;

    if (jtype === "boolean") {
      return "boolean";
    } else if (jtype === "number") {
      if (value % 1 === 0)
        return "integer";
      else
        return "float";
    } else if (jtype === "string") {
      if (value.length == 0)
        return "null";
      else if (ynBoolean(value) !== null)
        return "boolean";
      else if (Types.isDate(value))
        return "date";
      else if (value.length > 0 && value.length <= Types.maxKeywordLength && !(/\s/g.test(value))) {
        return "keyword";
      }
      else
        return "text";
    } else if (jtype === "object") {
      if (value === null)
        return "null";
      if (value.constructor.name === "Date")
        return "date";
    }
  }

  /**
   * Returns true if value is a local date, ISO date; time is optional
   * @param {*} value a string
   */
  static isDate(value) {
    //console.log(value)
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
          //console.log("bad time")
          return false;
        }
        // should do separator checks
        // should do timezone checks
      }
    }

    // post checks
    if (inDate && numSeparators < 2) {
      //console.log("post")
      return false;
    }

    //console.log("true");
    return true;
  }

  /**
   * Truncate time if zero, otherwise return ISO data string
   * @param {*} value
   */
  static formatDate(value) {
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
  }

}

Types.maxKeywordLength = 32;
Types.maxKeywordValues = 128;

module.exports = Types;
