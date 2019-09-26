/**
 * test/store
 */
"use strict";

const storage = require("../../index");

module.exports = async function (options) {

  console.log(">>> create junction");
  var junction = storage.activate(options.src_smt);

  try {
    let uid = await junction.store(options.construct, options.options);
    console.log(uid);

    console.log(">>> completed");
    return uid;
  }
  catch (err) {
    if (err.statusCode < 500)
      console.log(err.message);
    else
      console.error('!!! Pipeline failed', err.message);
  }
  finally {
    await junction.relax();
  }

};
