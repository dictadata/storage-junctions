/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: csv Codify");

async function tests() {
  logger.verbose("=== csv > csv_encoding_x");
  if (await codify({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    outputFile1: './data/output/csv/encoding_1.json',
    outputFile2: './data/output/csv/encoding_2.json'
  })) return 1;

  logger.verbose("=== csv.gz > csv_encoding_gz")
  if (await codify({
    origin: {
      smt: "csv|./data/test/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    outputFile1: './data/output/csv/encoding_g1.json',
    outputFile2: './data/output/csv/encoding_g2.json'
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
