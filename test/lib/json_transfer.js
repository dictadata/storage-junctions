/**
 * test/json
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: json");

async function tests() {
  logger.verbose('./test/data/testfile.json');

  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "json|./test/output/|json_output.json|*"
    }
  });
  logger.verbose('./test/output/json_output.json');

  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "csv|./test/output/|json_output.csv|*"
    }
  });
  logger.verbose('./test/output/json_output.json');

  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "json|S3:dictadata.org/subfolder/|json_output.json.gz|*"
    }
  });
  logger.verbose('S3:dictadata.org/subfolder/json_output.json.gz');

}

tests();
