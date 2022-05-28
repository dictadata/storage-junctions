/**
 * test/zip/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: zip transfers");

async function test_01() {
  logger.verbose("=== zip source");

  logger.verbose('=== zip foofile.json');
  if (await transfer({
    origin: {
      smt: "json|zip:./data/input/foofile.zip|foofile.json|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/zip/|foofile.json|*"
    }
  })) return 1;

  logger.verbose('=== zip foofile_01.json');
  if (await transfer({
    origin: {
      smt: "json|zip:./data/input/foofile.zip|subfolder/foofile_01.json|*",
      options: {}
    },
    terminal: {
      smt: "json|./data/output/zip/|foofile_01.json|*"
    }
  })) return 1;


}

(async () => {
  if (await test_01()) return;
})();
