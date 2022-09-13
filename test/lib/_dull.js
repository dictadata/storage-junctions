/**
 * test/dull
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const Storage = require("../../storage");
const { logger } = require('../../storage/utils');

module.exports = exports = async function (tract) {
  let retCode = 0;

  logger.info(">>> create junction");
  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);

    let results = await jo.dull(tract.origin.pattern);
    logger.verbose(JSON.stringify(results));

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

  return process.exitCode = retCode;
};
