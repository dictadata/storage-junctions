/**
 * test/store
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../storage");
const logger = require('../../storage/logger');

module.exports = exports = async function (tract, keyValues) {
  logger.info(">>> create junction");
  let retCode = 0;

  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.getEncoding();
    let encoding = results.data["encoding"];

    results = await jo.store(tract.construct, tract.origin.pattern);
    logger.verbose(JSON.stringify(results));

    logger.info(">>> completed");
    // check for a returnd keystore UniqueID value
    if (keyValues && results.data && !Array.isArray(results.data)) {
      keyValues.uid = Object.keys(results.data)[0];
    }
  }
  catch (err) {
    if (err.statusCode < 500)
      logger.warn(err.message);
    else {
      logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
      retCode = 1;
    }
  }
  finally {
    if (jo) await jo.relax();
  }

  return process.exitCode = retCode;
};
