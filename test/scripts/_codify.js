/**
 * test/transfer
 */
"use strict";

const storage = require("../../index");
const util = require('util');
const stream = require('stream');
const fs = require('fs');

const pipeline = util.promisify(stream.pipeline);

module.exports = async function (options) {

  console.log(">>> create junction");
  var j1 = storage.activate(options.src_smt);

  try {
    // *** the normal way is to ask the junction to do it
    console.log(">>> getEncoding");
    let encoding1 = await j1.getEncoding();
    //console.log(JSON.stringify(encoding1, null, "  "));

    console.log(">>> save encoding to output/codify_encoding1.json");
    fs.writeFileSync('./test/output/codify_encoding1.json', JSON.stringify(encoding1), "utf8");

    // *** stream some data to the codifier
    console.log(">>> create streams");
    var reader = j1.getReadStream({ codify: true, max_read: 1000 });
    var codify = j1.getCodifyTransform();

    console.log(">>> start pipe");
    await pipeline(reader, codify);

    let encoding2 = await codify.getEncoding();
    //console.log(JSON.stringify(encoding2, null, "  "));

    console.log(">>> save encoding to output/codify_encoding2.json");
    fs.writeFileSync('./test/output/codify_encoding2.json', JSON.stringify(encoding2), "utf8");

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! pipeline failed', err.message);
  }
  finally {
    await j1.relax();
  }

};
