/**
 * test/http/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');


logger.info("=== Test: http transfers");

async function test_01() {
  logger.verbose("=== http source");

  logger.verbose('=== http_output.csv');
  await transfer({
    origin: {
      smt: "csv|http://localhost/test/data/|foofile.csv.gz|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./output/|http_output.csv|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== http_output.csv.gz');
  await transfer({
    origin: {
      smt: "csv|http://localhost/test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "csv|./output/|http_output.csv.gz|*",
      options: {
        header: true
      }
    }
  });

  logger.verbose('=== http_output.json');
  await transfer({
    origin: {
      smt: "json|http://localhost/test/data/|foofile.json.gz|*",
      options: {
      }
    },
    terminal: {
      smt: "json|./output/|http_output.json|*"
    }
  });

  logger.verbose('=== http_output.json.gz');
  await transfer({
    origin: {
      smt: "json|http://localhost/test/data/|foofile.json|*",
      options: {
      }
    },
    terminal: {
      smt: "json|./output/|http_output.json.gz|*"
    }
  });

}

(async () => {
  await test_01();
})();
