"use strict";

const storage = require("../../index");
const EchoJunction = require("../../lib/echo");
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

console.log("=== Tests: EchoJunction");

async function testStream() {
  console.log("=== testStream");

  try {
    console.log(">>> adding EchoJunction");
    storage.use("echo", EchoJunction);

    console.log(">>> create junction");
    var junction = storage.activate("echo|local|test|*");

    console.log(">>> create streams");
    var reader = junction.getReadStream({});
    var writer = junction.getWriteStream({});

    console.log(">>> start pipe");
    await pipeline(reader,writer);

    await junction.relax();
    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! Pipeline failed', err);
  }

}

async function tests() {
  await testStream();
}

tests();
