/**
 * test/compare
 */
"use strict";

const { logger, isDate } = require('../../storage/utils');

const fs = require('node:fs');
const path = require('node:path');
const { unzipSync } = require('node:zlib');
const { typeOf } = require("../../storage/utils");

function compareText(output, expected, compareValues) {

  let outLines = output.split(/\r?\n/);
  let expLines = expected.split(/\r?\n/);

  if (outLines.length !== expLines.length) {
    logger.error(`output file has different length ${outLines.length} ${expLines.length}`);
    return 1;
  }

  if (compareValues > 1) {
    for (let i = 0; i < outLines.length; i++) {
      if (outLines[ i ] !== expLines[ i ]) {
        logger.error("contents of files are not equal on line: " + (i + 1));
        logger.error(outLines[ i ]);
        logger.error(expLines[ i ]);
        return 1;
      }
    }
  }

  return 0;
}

function compareBuffer(output, expected, compareValues) {

  let ok = (output.length === expected.length);
  if (!ok) {
    logger.error(`output files have different lengths ${output.length} ${expected.length}`);
    return 1;
  }

  if (compareValues > 1) {
    let ok = output.compare(expected) === 0;
    if (!ok) {
      logger.error("contents of files are not equal");
      return 1;
    }
  }

  return 0;
}

function compareCSV(output, expected, compareValues) {
  return 0;

  // using compareText for now
}

/**
 *
 * @param {*} var1 output value
 * @param {*} var2 expected value
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
 * @param {*} output_filename filename of output data
 * @param {*} expected_filename filename of expected data
 * @param {*} compareValues 0 = no, 1 = compare basic values , 2 = compare dates and array lengths
 * @returns 0 if OK, 1 if different
 */
function compareFiles(output_filename, expected_filename, compareValues = 1) {
  logger.info(">>> compare files");
  if (compareValues <= 0)
    return 0;

  let ext1 = path.extname(output_filename);
  let ext2 = path.extname(expected_filename);
  logger.info(">>> " + output_filename + " === " + expected_filename);

  // unzip, if needed
  if (ext1 === ".gz")
    ext1 = path.extname(expected_filename.substring(0, output_filename.length - 3));
  if (ext2 === ".gz")
    ext2 = path.extname(output_filename.substring(0, expected_filename.length - 3));

  // compare file extensions
  if (ext1 !== ext2) {
    logger.error("Compare filename extension mismatch!");
    return 1;
  }

  // read files
  let output = fs.readFileSync(output_filename, { encoding: 'utf8' });
  if (path.extname(output_filename) === '.gz')
    output = unzipSync(output);
  let expected = fs.readFileSync(expected_filename, { encoding: 'utf8' });
  if (path.extname(expected_filename) === '.gz')
    expected = unzipSync(expected);

  // choose parser
  if (ext1 === '.json')
    return compareJSON(JSON.parse(output), JSON.parse(expected), compareValues);
  else if (ext1 === '.csv')
    return compareText(output, expected, compareValues);
  else if ([ '.txt', '.jsons', '.jsono', '.jsonl', 'jsona' ].includes(ext1))
    return compareText(output, expected, compareValues);
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
