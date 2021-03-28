/**
 * test/dull
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../storage");
const logger = require('../../storage/logger');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);

    let results = await jo.dull(tract.origin.pattern);
    logger.verbose(JSON.stringify(results));

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
    process.exitCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

};
