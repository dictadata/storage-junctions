// storage/utils/isDate
"use strict";

/**
 * Returns true if value is a local date, ISO date; time is optional
 * @param {*} value a string
 */
function isDate (value) {
  //console.log(value);
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
        //console.error("bad time");
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

  if (separator !== '-' || parts[0].length < 4)
    return 2;  // non-ISO date string

  return 1;  // ISO compatiable date string
};

module.exports = exports = isDate;
