/**
 * test/gzip
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs_gzip_output.csv.gz');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "csv|./test/output/|fs_gzip_output.csv.gz|*"
    }
  });

  logger.verbose('=== csv.gz => fs_gzip_output.csv');
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv.gz|*"
    },
    destination: {
      smt: "csv|./test/output/|fs_gzip_output.csv|*"
    }
  });

  logger.verbose('=== json => fs_gzip_output.json.gz');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    destination: {
      smt: "json|./test/output/|fs_gzip_output.json.gz|*"
    }
  });

  logger.verbose('=== json.gz => fs_gzip_output.json');
  await transfer({
    source: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    destination: {
      smt: "json|./test/output/|fs_gzip_output.json|*"
    }
  });

}

tests();
