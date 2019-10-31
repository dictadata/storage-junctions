/**
 * test/gzip
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: gzip");

async function tests() {

  logger.verbose('=== gzip_output.csv.gz');
  await transfer({
    source: {
      smt: "csv|./test/data/|testfile2.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|gzip_output.csv.gz|*"
    }
  });

  logger.verbose('=== gzip_output.csv');
  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv.gz|*"
    },
    destination: {
      smt: "csv|./test/output/|gzip_output.csv|*"
    }
  });

  logger.verbose('=== gzip_output.json.gz');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "json|./test/output/|gzip_output.json.gz|*"
    }
  });

  logger.verbose('=== gzip_output.json');
  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json.gz|*"
    },
    destination: {
      smt: "json|./test/output/|gzip_output.json|*"
    }
  });

}

tests();
