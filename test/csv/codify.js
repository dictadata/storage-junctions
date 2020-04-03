/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: csv Codify");

async function tests() {
  logger.verbose("=== csv > csv_encoding_x");
  await codify({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    outputFile1: './test/output/csv_encoding_1.json',
    outputFile2: './test/output/csv_encoding_2.json'
  });

  logger.verbose("=== csv.gz > csv_encoding_gx")
  await codify({
    source: {
      smt: "csv|./test/data/|foofile.csv.gz|*"
    },
    outputFile1: './test/output/csv_encoding_g1.json',
    outputFile2: './test/output/csv_encoding_g2.json'
  });

}

tests();
