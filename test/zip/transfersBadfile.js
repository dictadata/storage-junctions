/**
 * test/zip/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('@dictadata/storage-lib');


logger.info("=== Test: zip transfers");

async function tests() {
  logger.verbose("=== zip source");

  logger.verbose('=== zip foofile_badfile');
  if (await transfer({
    origin: {
      smt: "json|zip:./test/data/input/foofile_badfile.zip|foofile.json|*"
    },
    terminal: {
      smt: "json|./test/data/output/zip/|foofile_badfile.json|*",
      output: "./test/data/output/zip/foofile_badfile.json"
    }
  }, -1)) return 1;

}

(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
