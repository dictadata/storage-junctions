/**
 * test/zip/transfers
 */
"use strict";

const transfer = require('../_transfer');
const { logger } = require('@dictadata/lib');


logger.info("=== Test: zip transfers");

async function tests() {
  logger.verbose("=== zip source");

  logger.verbose('=== zip foofile.json');
  if (await transfer({
    origin: {
      smt: "json|zip:./test/data/input/foofile.zip|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/data/output/zip/|foofile.json|*"
    }
  })) return 1;

  logger.verbose('=== zip foofile_01.json');
  if (await transfer({
    origin: {
      smt: "json|zip:./test/data/input/foofile.zip/subfolder/|foofile_01.json|*",
      options: {}
    },
    terminal: {
      smt: "json|./test/data/output/zip/|foofile_01.json|*"
    }
  })) return 1;


}

(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
