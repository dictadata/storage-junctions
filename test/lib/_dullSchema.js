/**
 * test/list
 */
"use strict";

const storage = require("../../lib/index");
const logger = require('../../lib/logger');
const fs = require('fs');
const path = require('path');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + JSON.stringify(tract.smt, null, 2));
  if (tract.options) logger.verbose("options:" + JSON.stringify(tract.options));

  var jo;
  try {
    jo = await storage.activate(tract.smt, tract.options);
    logger.info(">>> dullSchema");
    let result = await jo.dullSchema();
    logger.info(result);
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
    process.exitCode = 1;
  }
  finally {
    if (jo)
      await jo.relax();
  }

};
