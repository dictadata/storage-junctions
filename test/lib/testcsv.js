"use strict";

const storage = require("../../index");
const stream = require('stream');
const util = require('util');
//const CsvJunction = require("../lib/csv");

console.log("<<< Test: csv");

async function test() {

  const pipeline = util.promisify(stream.pipeline);

  try {
    console.log(">>> create junctions");
    var j1 = storage.create("csv|./test/data/|testfile.csv|*", {filename: './test/data/testfile.csv'});
    var j2 = storage.create("csv|./test/output/|testoutput.csv|*", {filename: './test/output/testoutput.csv'});

    console.log(">>> get source encoding (codify)");
    let encoding = await j1.getEncoding();

    console.log(">>> encoding results");
    console.log(encoding);
    //console.log(JSON.stringify(encoding.fields));

    console.log(">>> put destination encoding");
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
