/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Tests: transfer w/ transforms");

async function tests() {

  logger.info("=== compose");
  await transfer({
    origin: {
      smt: "json|./test/data/|db_schema.json|*",
      options: {},
      encoding: "./test/data/db_schema_encoding.json"
    },
    "transforms": {
      compose: {
        path: ["SCHEMA_NAME", "TABLE_NAME", "COLUMN_NAME"]
      }
    },
    terminal: {
      "smt": 'json|./output/compose/|db_schema.json|*',
      options: {}
    }
  });

  logger.info("=== flatten");
  await transfer({
    origin: {
      smt: "json|./output/compose/|db_schema.json|*",
      options: {}
    },
    "transforms": {
      flatten: {
        path: ["SCHEMA_NAME", "TABLE_NAME", "COLUMN_NAME"]
      }
    },
    terminal: {
      "smt": 'csv|./output/flatten/|db_schema.csv|*',
      options: {
        header: true
      }
    }
  });

}

(async () => {
  await tests();
})();