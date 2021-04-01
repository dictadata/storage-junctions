/**
 * test/compare
 */
"use strict";

const { logger } = require('../../storage/utils');

const fs = require('fs');
const path = require('path');
const { unzipSync } = require('zlib');
const { typeOf, hasOwnProperty } = require("../../storage/utils");


function compareJSON(output1, output2, compareValues) {

  return 0;
}

function compareJSON(object1, object2, compareValues) {

  if (compareValues && typeOf(object1) !== typeOf(object2)) {
      logger.error(`objects are different types: ${typeOf(object1)} <> ${typeOf(object2)}`);
      return 1;
  }

  // walk the output1 object and compare to object2
  if (Array.isArray(object1)) {
    if (compareValues && object1.length !== object2.length) {
      logger.error("arrays have different lengths");
      return 1;
    }

    for (let i = 0; i < object1.length; i++) {
      if (compareJSON(object1[i], object2[i], compareValues))
        return 1;
    }
  }
  else if (typeOf(object1) === 'object') {
    let keys1 = Object.keys(object1);
    let keys2 = Object.keys(object2);
    if (compareValues && keys1.length != keys2.length) {
      logger.error("compare object maps have different lengths");
      return 1;
    }

    for (let key of Object.keys(object1)) {
      if (!hasOwnProperty(object2, key)) {
        logger.error("compare object2 does not contain property: " + key);
        return 1;
      }
      if (compareJSON(object1[key], object2[key], compareValues))
        return 1;
    }
  }
  else if (compareValues && object1 !== object2) {
    logger.error(`compare value mismatch: ${object1} <> ${object2}`)
    return 1;
  }

  return 0;  // values match
}

module.exports = exports = function (filename1, filename2, compareValues = true) {
  logger.info(">>> compare files");

  let ext1 = path.extname(filename1);
  let ext2 = path.extname(filename2);
  logger.info(">>> " + filename1 + " === " + filename2);
  
  // unzip, if needed
  if (ext1 === ".gz")
    ext1 = path.extname(filename1.substring(0,filename1.length-3))
  if (ext2 === ".gz")
    ext2 = path.extname(filename2.substring(0,filename2.length-3))

  // compare file extensions
  if (ext1 !== ext2) {
    logger.error("Compare filename extension mismatch!");
    return 1;
  }

  // read files
  let output1 = fs.readFileSync(filename1);
  if (path.extname(filename1) === '.gz')
    output1 = unzipSync(output1);
  let output2 = fs.readFileSync(filename2);
  if (path.extname(filename2) === '.gz')
    output2 = unzipSync(output2);

  // choose parser
  if (ext1 === '.json')
    return compareJSON(JSON.parse(output1), JSON.parse(output2), compareValues);
  else if (ext1 === '.csv')
    return compareCSV(output1, output2, compareValues)
  else {
    logger.error("compare unknown file extension");
    return 1;
  }
  
}
