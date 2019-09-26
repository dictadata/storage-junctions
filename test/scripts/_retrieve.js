/**
 * test/retrieve
 */
"use strict";

const storage = require("../../index");

module.exports = async function (options) {

  console.log(">>> create junction");
  var junction = storage.activate(options.src_smt);

  try {
    let results = await junction.retrieve(options.pattern, options.options);
    console.log(results);

    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! request failed', err.message);
  }
  finally {
    await junction.relax();
  }

};
