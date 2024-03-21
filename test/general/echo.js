/**
 * test/general/echo
 */
"use strict";

const { Storage } = require("../../storage");
const EchoJunction = require("../../storage/junctions/echo");
const { logger } = require('../../storage/utils');
const stream = require('node:stream/promises');

logger.info("=== Tests: EchoJunction");

async function testStream() {
  logger.info("=== testStream");
  let retCode = 0;

  var jo;
  try {
    logger.info(">>> adding EchoJunction to StorageJunctions registry");
    Storage.Junctions.use("echo", EchoJunction);

    logger.info(">>> create junction");
    jo = await Storage.activate({
      model: "echo",
      locus: "somewhere",
      schema: "container",
      key: "*"
    });

    logger.info(">>> create streams");
    var reader = jo.createReader();
    reader.on('error', (error) => {
      logger.error("echo reader: " + error.message);
    });

    var writer = jo.createWriter();
    writer.on('error', (error) => {
      logger.error("echo writer: " + error.message);
    });

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
