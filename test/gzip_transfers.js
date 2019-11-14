/**
 * test/gzip
 */
"use strict";

const transfer = require('./lib/_transfer');
const logger = require('../lib/logger');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => gzip_output.csv.gz');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|gzip_output.csv.gz|*"
    }
  });

  logger.verbose('=== csv.gz => gzip_output.csv');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv.gz|*"
    },
    destination: {
      smt: "csv|./test/output/|gzip_output.csv|*"
    }
  });

  logger.verbose('=== json => gzip_output.json.gz');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "json|./test/output/|gzip_output.json.gz|*"
    }
  });

  logger.verbose('=== json.gz => gzip_output.json');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    destination: {
      smt: "json|./test/output/|gzip_output.json|*"
    }
  });

}

tests();
