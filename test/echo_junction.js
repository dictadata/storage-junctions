/**
 * test/junctions
 */
"use strict";

const storage = require("../index");
const EchoJunction = require("../lib/echo");
const logger = require('../lib/logger');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

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
    var reader = jo.getReadStream();
    var writer = jo.getWriteStream();

    logger.info(">>> start pipe");
    await pipeline(reader, writer);

    if (jo) await jo.relax();
    logger.info(">>> completed");
  }
  catch (err) {
    console.log(err.message)
  }
  finally {
    if (jo) await jo.relax();
  }
}

async function tests() {
  await testStream();
}

tests();
