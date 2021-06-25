/**
 * test/junctions
 */
"use strict";

const storage = require("../../storage");
const { logger } = require('../../storage/utils');

logger.info("=== Tests: Generic * Junction");

async function test_1() {
  let retCode = 0;

  var junction;
  try {
    logger.info(">>> create junction");
    junction = await storage.activate({
      smt: {
        model: "*",
        locus: "./test/data/input/",
        schema: "*",
        key: "*"
      }
    });

    logger.info(">>> create filesystem");
    var stfs = await junction.getFileSystem();

    logger.info(">>> relax junction");
    if (junction) await junction.relax();

  }
  catch (err) {
    logger.error(err.message);
    retCode = 1;
  }
  finally {
    if (junction) await junction.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  if (await test_1()) return;
})();
