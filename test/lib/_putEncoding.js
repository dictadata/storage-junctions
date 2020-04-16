/**
 * test/putEncoding
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");

  var j1;
  try {
    j1 = await storage.activate(tract.origin.smt, tract.origin.options);

    let filename = (tract.origin.filename || "./test/data/foo_encoding.json");
    let encoding = JSON.parse(fs.readFileSync(filename, "utf8"));

    encoding = await j1.putEncoding(encoding);
    if (typeof encoding === 'object')
      logger.verbose(JSON.stringify(encoding));
    else
      logger.warn("could not create storage schema: " + encoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (j1) await j1.relax();
  }

};
