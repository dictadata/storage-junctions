/**
 * test/fs/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs/gzip_output.csv.gz');
  
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./data/output/fs/|gzip_output.csv.gz|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== csv.gz => fs/gzip_output.csv');
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./data/output/fs/|gzip_output.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== json => fs/gzip_output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile.json|*"
    },
    terminal: {
      smt: "json|./data/output/fs/|gzip_output.json.gz|*"
    }
  })) return 1;

  logger.verbose('=== json.gz => fs/gzip_output.json');
  if (await transfer({
    origin: {
      smt: "json|./data/test/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|./data/output/fs/|gzip_output.json|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
