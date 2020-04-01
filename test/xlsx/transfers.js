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
    source: {
      smt: "csv|test/data/|foofile.csv|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "xlsx|test/output/xlsx_foofile_csv.xlsx|foo|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== xlsx > csv");
  await transfer({
    source: {
      smt: "xlsx|test/data/foofile.xlsx|foo|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "csv|test/output/|xlsx_foofile.csv|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== json > xlsx");
  await transfer({
    source: {
      smt: "json|test/data/|foofile.json|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "xlsx|test/output/xlsx_foofile_json.xlsx|foo|*",
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== xls > json");
  await transfer({
    source: {
      smt: "xlsx|test/data/foofile.xls|foo|*",
      options: {
        logger: logger
      }
    },
    destination: {
      smt: "json|test/output/|xlsx_foofile.json|*",
      options: {
        logger: logger
      }
    }
  });

}

tests();
