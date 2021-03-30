/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Tests: transfer w/ transforms");

async function tests() {

  logger.info("=== compose");
  if (await transfer({
    origin: {
      smt: "json|./data/test/|table_schemas.json|*",
      options: {
        encoding: "./data/test/table_schemas_encoding.json"
      }      
    },
    "transforms": {
      compose: {
        path: ["SCHEMA_NAME", "TABLE_NAME", "COLUMN_NAME"]
      }
    },
    terminal: {
      "smt": 'json|./data/output/transforms/|compose_schemas.json|*',
      options: {}
    }
  })) return 1;

  logger.info("=== flatten");
  if (await transfer({
    origin: {
      smt: "json|./data/output/transforms/|compose_schemas.json|*",
      options: {}
    },
    "transforms": {
      flatten: {
        path: ["SCHEMA_NAME", "TABLE_NAME", "COLUMN_NAME"]
      }
    },
    terminal: {
      "smt": 'csv|./data/output/transforms/|flatten_schemas.csv|*',
      options: {
        header: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();