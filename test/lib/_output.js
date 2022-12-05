/**
 * test/output
 */
"use strict";

const _compare = require("./_compare");
const { logger } = require('../../storage/utils');
const fs = require('fs');
const path = require('path');

module.exports = exports = function (filename, data, compareValues = 1) {
  let retCode = 0;

  logger.info("<<< save results to " + filename);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(data, null, "  "), "utf8");

  let expected_output = filename.replace("output", "expected");
  retCode = _compare(expected_output, filename, compareValues);

  return retCode;
};
