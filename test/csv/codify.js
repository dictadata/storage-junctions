/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: csv codify");

async function tests() {

  logger.verbose("=== csv > csv_codify_x");
  if (await codify({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      output: './test/data/output/csv/codify_1.json'
    }
  })) return 1;

  logger.verbose("=== csv.gz > csv_codify_gz");
  if (await codify({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      output: './test/data/output/csv/codify_g1.json'
    }
  })) return 1;

  logger.verbose("=== csv missing values");
  if (await codify({
    missingValue: '*',
    origin: {
      smt: "csv|./test/data/input/|foo_missing.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      output: './test/data/output/csv/codify_2.json'
    }
  })) return 1;

}

(async () => {
  if (await tests()) return 1;
})();
