/**
 * test/compare
 */
"use strict";

const { logger, isDate } = require('../../storage/utils');

const fs = require('fs');
const path = require('path');
const { unzipSync } = require('zlib');
const { typeOf, hasOwnProperty } = require("../../storage/utils");


function compareCSV(expected, output, compareValues) {

  return 0;
}

/**
 *
 * @param {*} var1 expected value
 * @param {*} var2 test output value
 * @param {*} compareValues
 * @returns 0 if OK, 1 if different
 */
function compareJSON(var1, var2, compareValues) {
  if (!compareValues)
    return 0;

  // objects must be of same type
  if (typeOf(var2) !== typeOf(var1)) {
    logger.error(`objects are different types: ${typeOf(var2)} <> ${typeOf(var1)}`);
    return 1;
  }

  if (Array.isArray(var1)) {
    // check array lengths
    if (compareValues > 1 && var2.length !== var1.length) {
      logger.error("arrays have different lengths");
      return 1;
    }

    if (compareValues > 1) {
      // check array elements
      for (let i = 0; i < var1.length; i++) {
        if (compareJSON(var1[ i ], var2[ i ], compareValues))
          return 1;
      }
    }
  }
  else if (typeOf(var1) === 'object') {
    // walk var2 and compare to var1
    let keys1 = Object.keys(var1);
    let keys2 = Object.keys(var2);
    if (compareValues > 1 ? keys2.length != keys1.length : keys2.length < keys1.length) {
      logger.error("compare object maps have different lengths");
      return 1;
    }

    for (let key of keys1) {
      if (!hasOwnProperty(var2, key)) {
        logger.error("compare object2 does not contain property: " + key);
        return 1;
      }

      if (compareJSON(var1[ key ], var2[ key ], compareValues))
        return 1;
    }
  }
  // don't compare values of dates
  else if (compareValues > 1 && (var1 instanceof Date || (typeof var1 === "string" && isDate(var1)))) {
    return 0;
  }
  // check values of basic types
  else if (compareValues > 1 && var1 !== var2) {
    logger.error(`compare value mismatch: ${var1} <> ${var2}`);
    return 1;
  }

  return 0;  // values match
}

module.exports = exports = function (filename_expected, filename_output, compareValues = 1) {
  logger.info(">>> compare files");
  //return 0;

  let ext1 = path.extname(filename_expected);
  let ext2 = path.extname(filename_output);
  logger.info(">>> " + filename_expected + " === " + filename_output);

  // unzip, if needed
  if (ext1 === ".gz")
    ext1 = path.extname(filename_expected.substring(0, filename_expected.length - 3));
  if (ext2 === ".gz")
    ext2 = path.extname(filename_output.substring(0, filename_output.length - 3));

  // compare file extensions
  if (ext1 !== ext2) {
    logger.error("Compare filename extension mismatch!");
    return 1;
  }

  // read files
  let expected = fs.readFileSync(filename_expected);
  if (path.extname(filename_expected) === '.gz')
    expected = unzipSync(expected);
  let output = fs.readFileSync(filename_output);
  if (path.extname(filename_output) === '.gz')
    output = unzipSync(output);

  // choose parser
  if (ext1 === '.json')
    return compareJSON(JSON.parse(expected), JSON.parse(output), compareValues);
  else if (ext1 === '.csv')
    return compareCSV(expected, output, compareValues);
  else {
    logger.error("compare unknown file extension");
    return 1;
  }

}
