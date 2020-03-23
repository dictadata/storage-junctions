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

  var j1;
  try {
    logger.info(">>> adding EchoJunction to storage cortex");
    storage.use("echo", EchoJunction);

    logger.info(">>> create junction");
    j1 = await storage.activate({
      smt: {
        model: "echo",
        locus: "somewhere",
        schema: "container",
        key: "*"
      }
    });

    logger.info(">>> create streams");
    var reader = j1.getReadStream();
    var writer = j1.getWriteStream();

    logger.info(">>> start pipe");
    await pipeline(reader, writer);

    if (j1) await j1.relax();
    logger.info(">>> completed");
  }
  catch (err) {
    console.log(err.message)
  }
  finally {
    if (j1) await j1.relax();
  }
}

async function tests() {
  await testStream();
}

tests();
