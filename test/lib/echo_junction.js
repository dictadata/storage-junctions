/**
 * test/junctions
 */
"use strict";

const storage = require("../../index");
const EchoJunction = require("../../lib/echo");
const logger = require('../../lib/logger');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

logger.info("=== Tests: EchoJunction");

async function testStream() {
  logger.info("=== testStream");

  logger.info(">>> adding EchoJunction to storage cortex");
  storage.use("echo", EchoJunction);

  logger.info(">>> create junction");
  var junction = storage.activate({
    smt: {
      model:"echo",
      locus: "somewhere",
      schema: "container",
      key: "*"
    }
  });

  logger.info(">>> create streams");
  var reader = junction.getReadStream({});
  var writer = junction.getWriteStream({});

  logger.info(">>> start pipe");
  await pipeline(reader,writer);

  await junction.relax();
  logger.info(">>> completed");
}

async function tests() {
  await testStream();
}

tests();
