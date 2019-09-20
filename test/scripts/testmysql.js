"use strict";

const storage = require("../../index");
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

console.log("<<< Test: mysql");

async function test_recall() {
  console.log("--- TEST RECALL");

  try {
    console.log(">>> create junction");
    var junction = storage.create("mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*");

    //console.log(">>> create streams");
    //var reader = junction.getReadStream({});
    //var writer = junction.getWriteStream({});

    //console.log(">>> start pipe");
    //await pipeline(reader,writer);

    let results = await junction.recall({key: 1});
    console.log(results);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! Pipeline failed', err.message);
  }

}

async function test_reader() {
  console.log("--- TEST READER");

  try {
    console.log(">>> create junction");
    var j1 = storage.create("mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_table|*");
    var j2 = storage.create("csv|./test/output/|mysql_output.csv|*");

    console.log(">>> get source encoding");
    let encoding = await j1.getEncoding();

    console.log(">>> encoding results:");
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
    console.error('!!! Pipeline failed', err.message);
  }

}

async function test_writer() {
  console.log("--- TEST WRITER");

  try {
    console.log(">>> create junction");
    var j1 = storage.create("csv|./test/data/|testfile.csv|*");
    var j2 = storage.create("mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_writer|*");

    console.log(">>> get source encoding");
    let encoding = await j1.getEncoding();

    console.log(">>> encoding results:");
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
    console.error('!!! Pipeline failed', err.message);
  }

}

async function test_all() {

  await test_recall();
  await test_reader();
  await test_writer();

}

test_all();
