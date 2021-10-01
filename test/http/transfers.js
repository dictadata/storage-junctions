/**
 * test/http/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: http data transfers");

async function test_transfers() {

  logger.verbose('=== http json to local csv');
  if (await transfer({
    origin: {
      smt: "json|http://localhost/data/dictadata.org/test/input/|foofile.json|*",
    },
    terminal: {
      smt: "csv|./test/data/output/http/|foofile.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

  logger.verbose('=== http csv to local json');
  if (await transfer({
    origin: {
      smt: "csv|http://localhost/data/dictadata.org/test/input/|foofile.csv|*",
      options: {
        header: true,
        encoding: "./test/data/input/foo_schema.encoding.json"
      }
    },
    terminal: {
      smt: "json|./test/data/output/http/|foofile.json|*"
    }
  })) return 1;

}

async function test_uncompress() {

  logger.verbose('=== http .gz to local json');
  if (await transfer({
    origin: {
      smt: "json|http://localhost/data/dictadata.org/test/input/|foofile.json.gz|*"
    },
    terminal: {
      smt: "json|./test/data/output/http/|foofile_ungz.json|*"
    }
  })) return 1;

  logger.verbose('=== http .gz to local csv');
  if (await transfer({
    origin: {
      smt: "csv|http://localhost/data/dictadata.org/test/input/|foofile.csv.gz|*"
    },
    terminal: {
      smt: "csv|./test/data/output/http/|foofile_ungz.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;

}

(async () => {
  if (await test_transfers()) return 1;
  if (await test_uncompress()) return 1;
})();
