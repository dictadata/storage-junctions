/**
 * test/list
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../storage");
const { logger } = require('../../storage/utils');
const fs = require('fs');
const path = require('path');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");
  let retCode = 0;

  if (tract.origin)
    tract = tract.origin;
  
  logger.verbose("smt:" + JSON.stringify(tract.smt, null, 2));
  if (tract.options) logger.verbose("options:" + JSON.stringify(tract.options));

  var jo;
  try {
    jo = await storage.activate(tract.smt, tract.options);
    logger.info(">>> dullSchema");
    let results = await jo.dullSchema();
    logger.info(JSON.stringify(results));
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo)
      await jo.relax();
  }

  return process.exitCode = retCode;
};
