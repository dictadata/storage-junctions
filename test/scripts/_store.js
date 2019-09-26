/**
 * test/store
 */
"use strict";

const storage = require("../../index");

module.exports = async function (options) {

  try {
    console.log(">>> create junction");
    var junction = storage.activate(options.src_smt);

    let uid = await junction.store(options.construct, options.options);
    console.log(uid);

    await junction.release();
    console.log(">>> completed");

    return uid;
  }
  catch (err) {
    console.error('!!! Pipeline failed', err.message);
  }

};
