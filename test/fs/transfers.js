/**
 * test/fs/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs/gzip_output.csv.gz');
  
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./output/fs/|gzip_output.csv.gz|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== csv.gz => fs/gzip_output.csv');
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./output/fs/|gzip_output.csv|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== json => fs/gzip_output.json.gz');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    terminal: {
      smt: "json|./output/fs/|gzip_output.json.gz|*"
    }
  });

  logger.verbose('=== json.gz => fs/gzip_output.json');
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|./output/fs/|gzip_output.json|*"
    }
  });

}

(async () => {
  await tests();
})();
