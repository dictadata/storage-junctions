/**
 * test/retrieve
 */
"use strict";

const storage = require("../../index");

module.exports = async function (options) {

  try {
    console.log(">>> create junction");
    var junction = storage.activate(options.src_smt);

    let results = await junction.retrieve(options.pattern);
    console.log(results);

    await junction.relax();
    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! Pipeline failed', err.message);
  }

};
