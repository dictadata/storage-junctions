/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: split file");

async function tests() {

  logger.verbose('=== json extract results.0.items');
  if (await transfer({
    "origin": {
      "smt": "json|./data/input/|extract_data.json|*",
      "options": {
        "extract": "results.0.items"
      }
    },
    "terminal": {
      "smt": "json|./data/output/pipelines/|extracted_data.json|*",
      "output": "./data/output/pipelines/extracted_data.json"
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
