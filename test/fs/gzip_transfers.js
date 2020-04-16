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
    origin: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    terminus: {
      smt: "csv|./test/output/|fs_gzip_output.csv.gz|*"
    }
  });

  logger.verbose('=== csv.gz => fs_gzip_output.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*"
    },
    terminus: {
      smt: "csv|./test/output/|fs_gzip_output.csv|*"
    }
  });

  logger.verbose('=== json => fs_gzip_output.json.gz');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminus: {
      smt: "json|./test/output/|fs_gzip_output.json.gz|*"
    }
  });

  logger.verbose('=== json.gz => fs_gzip_output.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    terminus: {
      smt: "json|./test/output/|fs_gzip_output.json|*"
    }
  });

}

tests();
