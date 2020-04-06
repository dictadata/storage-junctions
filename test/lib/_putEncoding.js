/**
 * test/putEncoding
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger').test();
const fs = require('fs');

module.exports = exports = async function (options) {

  logger.info(">>> create junction");

  var j1;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);

    let filename = "./test/data/" + (options.source.filename || "foo_encoding.json");
    let encoding = JSON.parse(fs.readFileSync(filename, "utf8"));

    let newencoding = await j1.putEncoding(encoding);
    if (typeof newencoding === 'object')
      logger.verbose(JSON.stringify(newencoding));
    else
      logger.warn("could not create storage schema: " + newencoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (j1) await j1.relax();
  }

};
