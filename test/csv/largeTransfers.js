/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../storage/logger');

logger.info("=== Test: csv transfers");

async function tests() {

  logger.verbose('=== fueltrim.csv > csv_fueltrim.json');
  if (await transfer({
    origin: {
      smt: "csv|./data/test/|fueltrim.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "json|./data/output/csv/|fueltrim.json|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
