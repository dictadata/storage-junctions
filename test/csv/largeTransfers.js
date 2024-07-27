/**
 * test/csv
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: csv transfers");

async function tests() {

  logger.verbose('=== fueltrim.csv > csv_fueltrim.json');
  if (await transfer({
    origin: {
      smt: "csv|/var/dictadata/test/data/input/|fueltrim.csv|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "json|/var/dictadata/test/data/output/csv/|fueltrim.json|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
