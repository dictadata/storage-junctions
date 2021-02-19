/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: split file");

async function tests() {

  logger.verbose('=== db_schema_data => ./output/DB/');
  await transfer({
    "origin": {
      "smt": "json|./test/data/|db_schema_data.json|*",
      "options": {
        "pick": "results.0.items"
      }
    },
    "terminal": {
      "smt": "json|./output/pipelines/|db_data.json|*"
    }
  });
}

(async () => {
  await tests();
})();
