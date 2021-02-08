/**
 * test/xlsx/transfer
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx");


async function tests() {

  logger.info("=== csv > xlsx");
  await transfer({
    origin: {
      smt: "csv|test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "xlsx|./output/xlsx_foofile_csv.xlsx|foo|*",
      options: {}
    }
  });

  logger.info("=== xlsx > csv");
  await transfer({
    origin: {
      smt: "xlsx|test/data/foofile.xlsx|foo|*",
      options: {}
    },
    terminal: {
      smt: "csv|./output/|xlsx_foofile.csv|*",
      options: {
        header: true
      }
    }
  });

  logger.info("=== json > xlsx");
  await transfer({
    origin: {
      smt: "json|test/data/|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "xlsx|./output/xlsx_foofile_json.xlsx|foo|*",
      options: {}
    }
  });

  logger.info("=== xls > json");
  await transfer({
    origin: {
      smt: "xlsx|test/data/foofile.xls|foo|*",
      options: {}
    },
    terminal: {
      smt: "json|./output/|xlsx_foofile.json|*",
      options: {}
    }
  });

}

(async () => {
  await tests();
})();
