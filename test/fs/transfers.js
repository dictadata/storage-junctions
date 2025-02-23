/**
 * test/fs/transfers
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs/gzip_output.csv.gz');

  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/fs/|gzip_output.csv.gz|*",
      options: {
        addHeader: true
      }
    }
  })) return 1;

  logger.verbose('=== csv.gz => fs/gzip_output.csv');
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv.gz|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "csv|./test/_data/output/fs/|gzip_output.csv|*",
      options: {
        addHeader: true
      }
    }
  })) return 1;

  logger.verbose('=== json => fs/gzip_output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*"
    },
    terminal: {
      smt: "json|./test/_data/output/fs/|gzip_output.json.gz|*"
    }
  })) return 1;

  logger.verbose('=== json.gz => fs/gzip_output.json');
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|./test/_data/output/fs/|gzip_output.json|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
