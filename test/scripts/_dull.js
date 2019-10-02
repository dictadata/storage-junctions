/**
 * test/dull
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = async function (options) {

  logger.info(">>> create junction");
  var junction = storage.activate(options.src_smt);

  try {
    let results = await junction.dull(options.options);
    logger.verbose(results);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
