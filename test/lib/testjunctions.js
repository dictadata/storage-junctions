"use strict";

const storage = require("../../index");
const EchoJunction = require("../../lib/echo");
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

console.log("<<< Test: echojunction");

async function test() {
  try {
    console.log(">>> adding EchoJunction");
    storage.use("echo", EchoJunction);

    console.log(">>> create junction");
    var junction = storage.create("echo|local|test|*");

    console.log(">>> create streams");
    var reader = junction.getReadStream({});
    var writer = junction.getWriteStream({});

    console.log(">>> start pipe");
    await pipeline(reader,writer);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! Pipeline failed', err);
  }

}

test();
