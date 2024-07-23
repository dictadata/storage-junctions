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
      smt: "text|zip:/var/dictadata/AR/Statewide Voter Files/VR.zip|VR.csv|*",
      options: {
        separator: ",",
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
      smt: "csv|zip:/var/dictadata/AR/Statewide Voter Files/VR.zip|VR.csv|*",
      options: {
        header: true,
        separator: ',',
        quoted: true,
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
