/**
 * test/fs/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs_gzip_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "csv|./output/|fs_gzip_output.csv.gz|*",
      options: {
        csvHeader: true
      }
    }
  });

  logger.verbose('=== csv.gz => fs_gzip_output.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "csv|./output/|fs_gzip_output.csv|*",
      options: {
        csvHeader: true
      }
    }
  });

  logger.verbose('=== json => fs_gzip_output.json.gz');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "json|./output/|fs_gzip_output.json.gz|*"
    }
  });

  logger.verbose('=== json.gz => fs_gzip_output.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|./output/|fs_gzip_output.json|*"
    }
  });

}

tests();
