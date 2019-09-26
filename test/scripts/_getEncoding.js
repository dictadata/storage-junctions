/**
 * test/getEncoding
 */
"use strict";

const storage = require("../../index");
const fs = require('fs');

module.exports = async function (options) {

  console.log(">>> create junction");
  var junction = storage.activate(options.src_smt);

  try {
    let encoding = await junction.getEncoding();
    if (encoding)
      console.log(JSON.stringify(encoding));
    else
      console.log("Could not get storage schema!");

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! request failed', err.message);
  }
  finally {
    await junction.relax();
  }

};
