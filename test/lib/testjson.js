"use strict";

const storage = require("../../index");
const stream = require('stream');
const util = require('util');
//const CsvJunction = require("../lib/csv");

console.log("<<< Test: json");

async function test() {

  const pipeline = util.promisify(stream.pipeline);

  try {
    console.log(">>> create junctions");
    var j1 = storage.create("json|./test/data/|testfile.json|*", {filename: './test/data/testfile.json'});
    var j2 = storage.create("json|./test/output/|testoutput.json|*", {filename: './test/output/testoutput.json'});

    //console.log(">>> get source encoding (codify)");
    let encoding = await j1.getEncoding();

    console.log(">>> encoding results");
    console.log(encoding);
    //console.log(JSON.stringify(encoding.fields));

    //console.log(">>> put destination encoding");
    await j2.putEncoding(encoding);

    console.log(">>> create streams");
    var reader = j1.getReadStream();
    var writer = j2.getWriteStream();

    console.log(">>> start pipe");
    await pipeline(reader, writer);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! pipeline failed', err);
  }
}

test();
