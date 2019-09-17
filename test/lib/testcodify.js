"use strict";

const storage = require("../../index");
const stream = require('stream');
const util = require('util');
//const CsvJunction = require("../lib/csv");

const pipeline = util.promisify(stream.pipeline);

console.log("<<< Test: codify");

async function test() {

  try {
    console.log(">>> create csv junction");
    var j1 = storage.create("csv|./test/data/|testfile.csv|*", {filename: './test/data/testfile.csv'});

    // the normal way is to ask the junction to do it
    //console.log(">>> codify");
    //let encoding = await j1.getEncoding();

    console.log(">>> create streams");
    var reader = j1.getReadStream({codify: true, max_lines: 1000});
    var codify = j1.getCodifyTransform();

    console.log(">>> start pipe");
    await pipeline(reader, codify);

    console.log(">>> encoding results");
    let encoding = await codify.getEncoding();
    //console.log(encoding);
    console.log(JSON.stringify(encoding, null, "  "));

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! Pipeline failed', err);
  }

}

test();
