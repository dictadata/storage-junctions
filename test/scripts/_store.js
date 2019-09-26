/**
 * test/store
 */
"use strict";

const storage = require("../../index");

module.exports = async function (options) {

  try {
    console.log(">>> create junction");
    var junction = storage.activate(options.src_smt);

    let id = await junction.store(options.construct, options.options);
    console.log(id);

    await junction.release();
    console.log(">>> completed");

    return id;
  }
  catch (err) {
    console.error('!!! Pipeline failed', err.message);
  }

};
