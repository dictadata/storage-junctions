/**
 * test/txt
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: txt transfers");

async function tests() {

  logger.verbose('=== fueltrim.txt > txt_fueltrim.json');
  if (await transfer({
    origin: {
      smt: "txt|/var/dictadata/test/data/input/|fueltrim.csv|*",
      options: {
        header: true,
        "separator": "\t"
      }
    },
    terminal: {
      smt: "json|/var/dictadata/test/data/output/text/|fueltrim.json|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
