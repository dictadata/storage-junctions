/**
 * test/fs/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs/gzip_output.csv.gz');

  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/fs/|gzip_output.csv.gz|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== csv.gz => fs/gzip_output.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/fs/|gzip_output.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== json => fs/gzip_output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*"
    },
    terminal: {
      smt: "json|./test/data/output/fs/|gzip_output.json.gz|*"
    }
  })) return 1;

  logger.verbose('=== json.gz => fs/gzip_output.json');
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|./test/data/output/fs/|gzip_output.json|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
