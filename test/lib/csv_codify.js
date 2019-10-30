/**
 * test/codify
 */
"use strict";

const codify = require('./_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: Codify");

async function tests() {
  await codify({
    source: {
      smt: "csv|./test/data/|testfile.csv|*",
      options: {}
    },
    outputFile1: './test/output/csv_encoding_1.json',
    outputFile2: './test/output/csv_encoding_2.json'
  });

  await codify({
    source: {
      smt: "csv|S3:dictadata.org/subfolder|testfile.csv.gz|*",
      options: {}
    },
    outputFile1: './test/output/csv_encoding_g1.json',
    outputFile2: './test/output/csv_encoding_g2.json'
  });

}

tests();
