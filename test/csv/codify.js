/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../storage/logger');

logger.info("=== tests: csv Codify");

async function tests() {
  logger.verbose("=== csv > csv_encoding_x");
  await codify({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    outputFile1: './data/output/csv/encoding_1.json',
    outputFile2: './data/output/csv/encoding_2.json'
  });

  logger.verbose("=== csv.gz > csv_encoding_gz")
  await codify({
    origin: {
      smt: "csv|./data/test/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    outputFile1: './data/output/csv/encoding_g1.json',
    outputFile2: './data/output/csv/encoding_g2.json'
  });

}

(async () => {
  await tests();
})();
