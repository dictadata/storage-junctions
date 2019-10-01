/**
 * test/store
 */
"use strict";

const storage = require("../../index");

module.exports = async function (options) {

  console.log(">>> create junction");
  var junction = storage.activate(options.src_smt);

  try {
    let results = await junction.store(options.construct, options.options);
    console.log(results);

    console.log(">>> completed");
    return results.key ? results.key : null;
  }
  catch (err) {
    if (err.statusCode < 500)
      console.log(err.message);
    else
      console.error('!!! request failed', err.message);
  }
  finally {
    await junction.relax();
  }

};
