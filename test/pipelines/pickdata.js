/**
 * test/json
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: split file");

async function tests() {

  logger.verbose('=== json extract results.0.items');
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|extract_data.json|*",
      options: {
        pick: "results.0.items"
      }
    },
    terminal: {
      smt: "json|./test/_data/output/pipelines/|extracted_data.json|*",
      output: "./test/_data/output/pipelines/extracted_data.json"
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
