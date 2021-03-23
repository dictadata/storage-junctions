// storage/utils/formatDate
"use strict";

const typeOf = require("./typeOf");
const isDate = require("./isDate");
const parseDate = require("./parseDate");

/**
 * Returns ISO date string, truncates time if zero.
 * @param {Date|string} value - is a Date or string representation of a date.
 */
function formatDate (value) {
  if (typeof value === "string") {
    if (value.startsWith("0000"))  // a null/empty date, e.g. "0000-00-00 00:00:00"
      return "";
    let t = isDate(value);
    if (t === 1)
      value = parseDate(value);
    else if (t)
      value = new Date(value);
    else
      return "";
  }

  if (typeOf(value) !== "date")
    return "";

  let iso = value.toISOString();
  let includesTime = false;
  // check for zero time,  e.g. YYYY-MM-DDT00:00:00.000Z
  // find first [1-9] digit in the time field
  for (let i = 11; i < iso.length; i++) {
    if (iso[i] >= "1" && iso[i] <= "9") {
      includesTime = true;
      break;
    }
  }

  if (!includesTime)
    iso = iso.substr(0,10);  // return just the date

  return iso;
};

module.exports = exports = formatDate;
