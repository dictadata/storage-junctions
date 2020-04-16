/**
 * test/list
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + tract.origin.smt);
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));

  var j1;
  try {
    j1 = await storage.activate(tract.origin.smt, tract.origin.options);
    logger.info(">>> list");
    let list = await j1.list();

    logger.debug("list: " + JSON.stringify(list, null, "  "));
    if (tract.outputFile) {
      logger.info(">>> save encoding to " + tract.outputFile);
      fs.writeFileSync(tract.outputFile, JSON.stringify(list,null,"  "), "utf8");
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await j1.relax();
  }

};
