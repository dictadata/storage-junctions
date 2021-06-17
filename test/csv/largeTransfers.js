/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Test: csv transfers");

async function tests() {

  logger.verbose('=== fueltrim.csv > csv_fueltrim.json');
  if (await transfer({
    origin: {
      smt: "csv|./test/data/|fueltrim.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "json|./test/data/output/csv/|fueltrim.json|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
