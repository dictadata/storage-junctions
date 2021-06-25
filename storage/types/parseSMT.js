// storage/types/parseSMT
"use strict";

const StorageError = require('./storage-error');
const { typeOf, hasOwnProperty } = require("../utils");

/**
 * parse an smt string into an object.
 * Returns an smt object.
 */
function parseSMT(value) {
  let smt;

  if (typeof value === "string") {
    let a = value.split("|");
    if (a.length != 4)
      throw new StorageError(400, "Invalid Parameter: SMT");
    
    smt = {
      model: a[0] || '',
      locus: a[1] || '',
      schema: a[2] || '',
      key: a[3] || ''
    };
  }
  else if (typeof value === "object") {
    smt = Object.assign(value);
  }

  if (typeOf(smt) !== "object"
    || !hasOwnProperty(smt, "model") || !hasOwnProperty(smt, "locus")
    || !hasOwnProperty(smt, "schema") || !hasOwnProperty(smt, "key"))
    throw new StorageError( 400, "Invalid Parameter: SMT");

  return smt;
};

module.exports = exports = parseSMT;
