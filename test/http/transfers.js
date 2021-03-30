/**
 * test/http/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');


logger.info("=== Test: http transfers");

async function test_01() {
  logger.verbose("=== http source");

  logger.verbose('=== http_output.csv');
  await transfer({
    origin: {
      smt: "csv|http://localhost/data/test/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./data/output/http/|output.csv|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== http_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|http://localhost/data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./data/output/http/|output.csv.gz|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== http_output.json');
  await transfer({
    origin: {
      smt: "json|http://localhost/data/test/|foofile.json.gz|*",
      options: {
      }
    },
    terminal: {
      smt: "json|./data/output/http/|output.json|*"
    }
  });

  logger.verbose('=== http_output.json.gz');
  await transfer({
    origin: {
      smt: "json|http://localhost/data/test/|foofile.json|*",
      options: {
      }
    },
    terminal: {
      smt: "json|./data/output/http/|output.json.gz|*"
    }
  });

}

(async () => {
  await test_01();
})();
