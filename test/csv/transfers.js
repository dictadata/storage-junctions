/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: csv transfers");

async function tests() {

  logger.verbose('=== csv > csv_output.csv');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|csv_output.csv|*"
    }
  });

  logger.verbose('=== csv > csv_output.json');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "json|./test/output/|csv_output.json|*"
    }
  });

}

tests();
