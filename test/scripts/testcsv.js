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
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "csv|./test/output/|csv_output.csv|*"
  });
  logger.verbose('./test/output/csv_output.csv');

  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "json|./test/output/|foo_output.json|*"
  });
  logger.verbose('./test/output/json_output.json');

}

tests();
