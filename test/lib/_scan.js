/**
 * test/scan
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + options.source.smt);
  if (options.source.options) logger.verbose("options:" + options.source.options);

  var j1;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);
    logger.info(">>> scan");
    let list = await j1.scan();

    logger.verbose("list: " + JSON.stringify(list, null, "  "));

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await j1.relax();
  }

};
