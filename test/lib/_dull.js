/**
 * test/dull
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose(options.source.smt);
  if (options.source.options)
    logger.verbose(JSON.stringify(options.source.options));
  var junction = storage.activate(options.source.smt);

  try {
    let results = await junction.dull(options.source.options);
    logger.verbose(JSON.stringify(results));

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
