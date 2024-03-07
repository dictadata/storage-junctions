/**
 * test/compare
 */
"use strict";

const { logger, isDate } = require('../../storage/utils');

const fs = require('fs');
const path = require('path');
const { unzipSync } = require('zlib');
const { typeOf } = require("../../storage/utils");

function compareText(expected, output, compareValues) {

  let expLines = expected.split(/\r?\n/);
  let outLines = output.split(/\r?\n/);

  if (expLines.length !== outLines.length) {
    logger.error(`output file has different length ${expLines.length} ${outLines.length}`);
    return 1;
  }

  if (compareValues > 1) {
    for (let i = 0; i < expLines.length; i++) {
      if (expLines[ i ] !== outLines[ i ]) {
        logger.error("contents of files are not equal on line: " + (i + 1));
        logger.error(expLines[ i ]);
        logger.error(outLines[ i ]);
        return 1;
      }
    }
  }

  return 0;
}

function compareBuffer(expected, output, compareValues) {

  let ok = (expected.length === output.length);
  if (!ok) {
    logger.error(`output files have different lengths ${expected.length} ${output.length}`);
    return 1;
  }

  if (compareValues > 1) {
    let ok = expected.compare(output) === 0;
    if (!ok) {
      logger.error("contents of files are not equal");
      return 1;
    }
  }

  return 0;
}

function compareCSV(expected, output, compareValues) {
  return 0;

  // using compareText for now
}

/**
 *
 * @param {*} var1 expected value
 * @param {*} var2 test output value
 * @param {*} compareValues 0 = no, 1 = compare basic values , 2 = compare dates and array lengths
 * @returns 0 if OK, 1 if different
 */
function compareJSON(var1, var2, compareValues) {
  if (!compareValues)
    return 0;

  // objects must be of same type
  if (typeOf(var1) !== typeOf(var2)) {
    logger.error(`objects are different types: ${typeOf(var1)} <> ${typeOf(var2)}`);
    return 1;
  }

  if (Array.isArray(var1)) {
    // check array lengths
    if (compareValues) {
      if (var1.length > 0 && var2.length === 0 || var1.length === 0 && var2.length > 0) {
        logger.error("arrays have different lengths");
        return 1;
      }
    }

    if (compareValues > 1) {
      // exact length match
      if (var2.length !== var1.length) {
        logger.error("arrays have different lengths");
        return 1;
      }

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
      if (!Object.hasOwn(var2, key)) {
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

/**
 * @param {*} var1 filename of expected data
 * @param {*} var2 filename of test output
 * @param {*} compareValues 0 = no, 1 = compare basic values , 2 = compare dates and array lengths
 * @returns 0 if OK, 1 if different
 */
function compareFiles(filename_expected, filename_output, compareValues = 1) {
  logger.info(">>> compare files");
  if (compareValues <= 0)
    return 0;

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
  let expected = fs.readFileSync(filename_expected, { encoding: 'utf8' });
  if (path.extname(filename_expected) === '.gz')
    expected = unzipSync(expected);
  let output = fs.readFileSync(filename_output, { encoding: 'utf8' });
  if (path.extname(filename_output) === '.gz')
    output = unzipSync(output);

  // choose parser
  if (ext1 === '.json')
    return compareJSON(JSON.parse(expected), JSON.parse(output), compareValues);
  else if (ext1 === '.csv')
    return compareText(expected, output, compareValues);
  else if ([ '.txt', '.jsons', '.jsono', '.jsonl', 'jsona' ].includes(ext1))
    return compareText(expected, output, compareValues);
  else {
    logger.error("compare unknown file extension");
    return 1;
  }

}

module.exports = exports = compareFiles;
exports.Files = compareFiles;
exports.Buffer = compareBuffer;
exports.CSV = compareCSV;
exports.JSON = compareJSON;
exports.Text = compareText;
