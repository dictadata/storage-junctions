/**
 * test/general/generic
 */
"use strict";

const { Storage } = require('../../storage');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: Generic * Junction");

async function test_1() {
  let retCode = 0;

  var junction;
  try {
    logger.info(">>> create junction");
    junction = await Storage.activate({
      model: "*",
      locus: "./test/_data/input/",
      schema: "*",
      key: "*"
    });

    logger.info(">>> create filesystem");
    let stfs = await junction.getFileSystem();

    logger.info(">>> relax junction");
    if (junction) await junction.relax();

  }
  catch (err) {
    logger.error(err.message);
    retCode = 1;
  }
  finally {
    if (junction)
      await junction.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  if (await test_1()) return;
})();
