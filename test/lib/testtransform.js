"use strict";

const storage = require("../../index");
const stream = require('stream');
const util = require('util');
//const CsvJunction = require("../lib/csv");

console.log("<<< Test: json");

async function test() {

  const pipeline = util.promisify(stream.pipeline);

  let transformOptions = {
    template: {},
    transforms: {
      "id": "id",
      "content": "content",
      "completed": "completed",
      "assignee.name": "name"
    }
  };

  try {
    console.log(">>> create junctions");
    var j1 = storage.create("json|./test/data/|testfile.json|*", {filename: './test/data/testfile.json'});
    var j2 = storage.create("json|./test/output/|testoutput.json|*", {filename: './test/output/testoutput.json'});

    //console.log(">>> get source encoding (codify)");
    var reader1 = j1.getReadStream({codify: true, max_lines: 1000});
    var transform1 = j1.getTransform(transformOptions);
    let codify1 = j1.getCodifyTransform();

    console.log(">>> start codify");
    await pipeline(reader1, transform1, codify1);
    let encoding = await codify1.getEncoding();

    console.log(">>> encoding results");
    console.log(encoding);
    //console.log(JSON.stringify(encoding.fields));

    //console.log(">>> put destination encoding");
    await j2.putEncoding(encoding);

    console.log(">>> create streams");
    var reader = j1.getReadStream();
    var transform = j1.getTransform(transformOptions);
    var writer = j2.getWriteStream();

    console.log(">>> start pipe");
    await pipeline(reader, transform, writer);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! pipeline failed', err);
  }
}

test();
