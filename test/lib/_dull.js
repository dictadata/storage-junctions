/**
 * test/dull
 */
"use strict";

const storage = require("../../lib/index");
const logger = require('../../lib/logger');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + tract.origin.smt);
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
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (jo) await jo.relax();
  }

};
