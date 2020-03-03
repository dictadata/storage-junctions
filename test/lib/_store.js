/**
 * test/store
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose(options.source.smt);
  logger.verbose("options: " + JSON.stringify(options.source.pattern));
  var junction = storage.activate(options.source.smt, options.source.options);

  try {
    let results = await junction.store(options.construct, options.source.pattern);
    logger.verbose(JSON.stringify(results));

    logger.info(">>> completed");
    if (results.data && !Array.isArray(results.data)) {
      return Object.keys(results.data)[0];
    } 
    return null;
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
