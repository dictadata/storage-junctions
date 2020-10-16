/**
 * test/junctions
 */
"use strict";

const storage = require("../lib/index");
const logger = require('../lib/logger');

logger.info("=== Tests: Generic * Junction");

async function test_1() {

  var junction;
  try {
    logger.info(">>> create junction");
    junction = await storage.activate({
      smt: {
        model: "*",
        locus: "./test/data/",
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
  }
  finally {
    if (junction) await junction.relax();
  }
}

(async () => {
  await test_1();
  logger.info(">>> completed");
})();
