/**
 * test/codify
 */
"use strict";

const codify = require('../_codify');
const logger = require('../../../lib/logger');

logger.info("=== tests: Codify");

async function tests() {
  await codify({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    outputFile1: './test/output/csv_encoding_1.json',
    outputFile2: './test/output/csv_encoding_2.json'
  });

  await codify({
    source: {
      smt: "csv|S3:dictadata.org/test/data/|foofile.csv.gz|*"
    },
    outputFile1: './test/output/csv_encoding_g1.json',
    outputFile2: './test/output/csv_encoding_g2.json'
  });

}

tests();
