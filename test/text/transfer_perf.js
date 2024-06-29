/**
 * test/linereader/transfers
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: linereader transfers");

async function tests() {

  logger.verbose('=== zip > nullwriter');
  if (await transfer({
    origin: {
      smt: "text|zip:/var/dictadata/NC/dl.ncsbe.gov/data/ncvoter_Statewide.zip|ncvoter_Statewide.txt|*",
      options: {
        separator: "\t",
        quoted: '"',
        header: true
      }
    },
    terminal: {
      smt: "null|*|*|*"
    }
  })) return 1;

  logger.verbose('=== csv > nullwriter');
  if (await transfer({
    origin: {
      smt: "csv|zip:/var/dictadata/NC/dl.ncsbe.gov/data/ncvoter_Statewide.zip|ncvoter_Statewide.txt|*",
      options: {
        header: true,
        separator: '\t',
        raw: true
      }
    },
    terminal: {
      smt: "null|*|*|*"
    }
  })) return 1;

}

(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
