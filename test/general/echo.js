/**
 * test/junctions
 */
"use strict";

const storage = require("../../storage");
const EchoJunction = require("../../storage/junctions/echo");
const { logger } = require('../../storage/utils');
const stream = require('stream/promises');

logger.info("=== Tests: EchoJunction");

async function testStream() {
  logger.info("=== testStream");
  let retCode = 0;

  var jo;
  try {
    logger.info(">>> adding EchoJunction to storage cortex");
    storage.use("echo", EchoJunction);

    logger.info(">>> create junction");
    jo = await storage.activate({
      smt: {
        model: "echo",
        locus: "somewhere",
        schema: "container",
        key: "*"
      }
    });

    logger.info(">>> create streams");
    var reader = jo.createReadStream();
    var writer = jo.createWriteStream();

    logger.info(">>> start pipe");
    await stream.pipeline(reader, writer);

    if (jo) await jo.relax();
    logger.info(">>> completed");
  }
  catch (err) {
    logger.error(err.message);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

  return process.exitCode = retCode;
}

(async () => {
  if (await testStream()) return;
})();
