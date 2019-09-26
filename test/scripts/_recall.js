/**
 * test/recall
 */
"use strict";

const storage = require("../../index");

module.exports = async function (options) {

  try {
    console.log(">>> create junction");
    var junction = storage.activate(options.src_smt);

    let results = await junction.recall(options.options);
    console.log(results);

    await junction.release();
    console.log(">>> completed");
  }
  catch (err) {
    console.error('!!! Pipeline failed', err.message);
  }

};
