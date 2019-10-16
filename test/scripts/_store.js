/**
 * test/store
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose(options.source.smt);
  logger.verbose("options: " + JSON.stringify(options.source.options));
  var junction = storage.activate(options.source.smt);

  try {
    let results = await junction.store(options.construct, options.source.options);
    logger.verbose(JSON.stringify(results));

    logger.info(">>> completed");
    return results.keys ? results.keys : null;
  }
  catch (err) {
    if (err.statusCode < 500)
      logger.warn(err.message);
    else
      logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
