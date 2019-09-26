/**
 * test/transfer
 */
"use strict";

const storage = require("../../index");
const util = require('util');
const stream = require('stream');

const pipeline = util.promisify(stream.pipeline);

module.exports = async function (options) {

  console.log(">>> create junctions");
  var j1 = storage.activate(options.src_smt, options.src_options);
  var j2 = storage.activate(options.dst_smt, options.dst_options);

  try {
    console.log(">>> get source encoding (codify)");
    let encoding = await j1.getEncoding();

    //console.log(">>> encoding results:");
    //console.log(encoding);
    //console.log(JSON.stringify(engram.fields));

    console.log(">>> put destination encoding");
    let result_encoding = await j2.putEncoding(encoding);
    if (!result_encoding)
      console.log("could not create storage schema, maybe it already exists");

    console.log(">>> create streams");
    var reader = j1.getReadStream();
    var writer = j2.getWriteStream();

    console.log(">>> start pipe");
    await pipeline(reader, writer);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! pipeline failed', err.message);
  }
  finally {
    await j1.relax();
    await j2.relax();
  }

};
