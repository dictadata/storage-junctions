/**
 * test/zip/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');


logger.info("=== Test: zip transfers");

async function tests() {
  logger.verbose("=== zip source");

  logger.verbose('=== zip foofile_badfile');
  if (await transfer({
    origin: {
      smt: "json|zip:./data/input/foofile_badfile.zip|foofile.json|*"
    },
    terminal: {
      smt: "json|./data/output/zip/|foofile_badfile.json|*",
      output: "./data/output/zip/foofile_badfile.json"
    }
  }, -1)) return 1;

}

(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
