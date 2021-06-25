/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: transfer w/ transforms");

async function tests() {

  logger.info("=== compose");
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|table_schemas.json|*",
      options: {
        encoding: "./test/data/input/table_schemas_encoding.json"
      }      
    },
    "transform": {
      compose: {
        path: ["SCHEMA_NAME", "TABLE_NAME", "COLUMN_NAME"]
      }
    },
    terminal: {
      "smt": 'json|./test/data/output/transforms/|compose_schemas.json|*',
      options: {}
    }
  })) return 1;

  logger.info("=== flatten");
  if (await transfer({
    origin: {
      smt: "json|./test/data/output/transforms/|compose_schemas.json|*",
      options: {}
    },
    "transform": {
      flatten: {
        path: ["SCHEMA_NAME", "TABLE_NAME", "COLUMN_NAME"]
      }
    },
    terminal: {
      "smt": 'csv|./test/data/output/transforms/|flatten_schemas.csv|*',
      options: {
        header: true
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();