/**
 * test/store
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../lib/index");
const logger = require('../../lib/logger');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.store(tract.construct, tract.origin.pattern);
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
    else {
      logger.error('!!! request failed: ' + err.message);
      process.exitCode = 1;
    }
  }
  finally {
    if (jo) await jo.relax();
  }

};
