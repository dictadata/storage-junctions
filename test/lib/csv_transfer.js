/**
 * test/csv
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: csv");

async function tests() {
  logger.verbose('./test/data/testfile.csv');

  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|csv_output.csv|*"
    }
  });
  logger.verbose('./test/output/csv_output.csv');

  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv|*"
    },
    destination: {
      smt: "json|./test/output/|foo_output.json|*"
    }
  });
  logger.verbose('./test/output/json_output.json');

  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|csv_output.csv.gz|*"
    }
  });
  logger.verbose('./test/output/csv_output.csv.gz');
}

tests();
