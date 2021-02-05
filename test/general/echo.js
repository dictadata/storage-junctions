/**
 * test/junctions
 */
"use strict";

const storage = require("../../lib/index");
const EchoJunction = require("../../lib/echo-junction");
const logger = require('../../lib/logger');
const stream = require('stream/promises');


logger.info("=== Tests: EchoJunction");

async function testStream() {
  logger.info("=== testStream");

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
  }
  finally {
    if (jo) await jo.relax();
  }
}

async function tests() {
  await testStream();
}

(async () => {
  await tests();
})();
