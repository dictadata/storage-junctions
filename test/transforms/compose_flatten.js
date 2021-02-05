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
      "smt": 'json|./output/|compose_db_schema.json|*',
      options: {}
    }
  });

  logger.info("=== flatten");

}

(async () => {
  await tests();
})();