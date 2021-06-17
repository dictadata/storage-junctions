/**
 * test/http/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: http transfers");

async function test_01() {
  logger.verbose("=== http source");

  logger.verbose('=== http_output.csv');
  if (await transfer({
    origin: {
      smt: "csv|http://localhost/data/test/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/http/|output.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== http_output.csv.gz');
  if (await transfer({
    origin: {
      smt: "csv|http://localhost/data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./test/data/output/http/|output.csv.gz|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== http_output.json');
  if (await transfer({
    origin: {
      smt: "json|http://localhost/data/test/|foofile.json.gz|*",
      options: {
      }
    },
    terminal: {
      smt: "json|./test/data/output/http/|output.json|*"
    }
  })) return 1;

  logger.verbose('=== http_output.json.gz');
  if (await transfer({
    origin: {
      smt: "json|http://localhost/data/test/|foofile.json|*",
      options: {
      }
    },
    terminal: {
      smt: "json|./test/data/output/http/|output.json.gz|*"
    }
  })) return 1;

}

(async () => {
  if (await test_01()) return;
})();
