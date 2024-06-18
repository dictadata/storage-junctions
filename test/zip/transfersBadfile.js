/**
 * test/zip/transfers
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');


logger.info("=== Test: zip transfers");

async function tests() {
  logger.verbose("=== zip source");

  logger.verbose('=== zip foofile_badfile');
  if (await transfer({
    origin: {
      smt: "json|zip:./test/_data/input/foofile_badfile.zip|foofile.json|*"
    },
    terminal: {
      smt: "json|./test/_data/output/zip/|foofile_badfile.json|*",
      output: "./test/_data/output/zip/foofile_badfile.json"
    }
  }, -1)) return 1;

}

(async () => {
  let rc = await tests();
  if (rc) return 1;
})();
