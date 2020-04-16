/**
 * test/store
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + tract.origin.smt);
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var j1;
  try {
    j1 = await storage.activate(tract.origin.smt, tract.origin.options);
    let results = await j1.store(tract.construct, tract.origin.pattern);
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
    if (j1) await j1.relax();
  }

};
