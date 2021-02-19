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
      smt: "json|./test/data/|table_schemas.json|*",
      options: {},
      encoding: "./test/data/table_schemas_encoding.json"
    },
    "transforms": {
      compose: {
        path: ["SCHEMA_NAME", "TABLE_NAME", "COLUMN_NAME"]
      }
    },
    terminal: {
      "smt": 'json|./output/transforms/|compose_schemas.json|*',
      options: {}
    }
  });

  logger.info("=== flatten");
  await transfer({
    origin: {
      smt: "json|./output/transforms/|compose_schemas.json|*",
      options: {}
    },
    "transforms": {
      flatten: {
        path: ["SCHEMA_NAME", "TABLE_NAME", "COLUMN_NAME"]
      }
    },
    terminal: {
      "smt": 'csv|./output/transforms/|flatten_schemas.csv|*',
      options: {
        header: true
      }
    }
  });

}

(async () => {
  await tests();
})();