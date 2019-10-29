/**
 * test/gzip
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: gzip");

async function tests() {
  logger.verbose('./test/data/testfile.csv');

  await transfer({
    source: {
      smt: "csv|./test/data/|testfile.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|gzip_output.csv.gz|*"
    }
  });
  logger.verbose('./test/output/gzip_output.csv.gz');

  await transfer({
    source: {
      smt: "csv|./test/output/|gzip_output.csv.gz|*"
    },
    destination: {
      smt: "csv|./test/output/|gzip_output.csv|*"
    }
  });
  logger.verbose('./test/output/gzip_output.csv');

  await transfer({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    destination: {
      smt: "json|./test/output/|gzip_output.json.gz|*"
    }
  });
  logger.verbose('./test/output/gzip_output.json.gz');

  await transfer({
    source: {
      smt: "json|./test/output/|gzip_output.json.gz|*"
    },
    destination: {
      smt: "json|./test/output/|gzip_output.json|*"
    }
  });
  logger.verbose('./test/output/gzip_output.json');

}

tests();
