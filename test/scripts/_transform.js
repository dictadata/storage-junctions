/**
 * test/transform
 */
"use strict";

const storage = require("../../index");
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

module.exports = async function (options) {

  console.log(">>> create junctions");
  var j1 = storage.activate(options.src_smt, options.src_options);
  var j2 = storage.activate(options.dst_smt, options.dst_options);

  try {
    //console.log(">>> get source encoding (codify)");
    var reader1 = j1.getReadStream({ codify: true, max_read: 1000 });
    var transform1 = j1.getTransform(options.transforms);
    let codify1 = j1.getCodifyTransform();

    console.log(">>> start codify");
    await pipeline(reader1, transform1, codify1);
    let encoding = await codify1.getEncoding();

    //console.log(">>> encoding results");
    //console.log(encoding);
    //console.log(JSON.stringify(engram.fields));

    //console.log(">>> put destination encoding");
    let result_encoding = await j2.putEncoding(encoding);
    if (!result_encoding)
      console.log("could not create storage schema, maybe it already exists");

    console.log(">>> create streams");
    var reader = j1.getReadStream();
    var transform = j1.getTransform(options.transforms);
    var writer = j2.getWriteStream();

    console.log(">>> start pipe");
    await pipeline(reader, transform, writer);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! request failed', err);
  }
  finally {
    await j1.relax();
    await j2.relax();
  }

};
