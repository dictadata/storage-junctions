/**
 * test/putEncoding
 */
"use strict";

const storage = require("../../index");
const fs = require('fs');

module.exports = async function (options) {

  console.log(">>> create junction");
  var junction = storage.activate(options.src_smt);

  try {
    let encoding = JSON.parse(fs.readFileSync("./test/data/testencoding.json", "utf8"));

    await junction.putEncoding(encoding);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! Pipeline failed', err.message);
  }
  finally {
    await junction.relax();
  }

};
