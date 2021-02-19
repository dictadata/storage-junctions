/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: split file");

async function tests() {

  logger.verbose('=== json pick results.0.items');
  await transfer({
    "origin": {
      "smt": "json|./test/data/|pick_data.json|*",
      "options": {
        "pick": "results.0.items"
      }
    },
    "terminal": {
      "smt": "json|./output/pipelines/|pick_data.json|*"
    }
  });
}

(async () => {
  await tests();
})();
