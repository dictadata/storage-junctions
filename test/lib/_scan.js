/**
 * test/scan
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = async function (options) {

  logger.info(">>> create junction");
  var j1 = storage.activate(options.source.smt, options.source.options);

  try {
    logger.info(">>> scan");
    let list = await j1.scan(options.scan);

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