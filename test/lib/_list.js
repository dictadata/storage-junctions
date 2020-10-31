/**
 * test/list
 */
"use strict";

const storage = require("../../lib/index");
const logger = require('../../lib/logger');
const fs = require('fs/promises');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (!tract.terminal) tract.terminal = {};

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    logger.info(">>> list");
    let list = await jo.list();

    logger.debug("list: " + JSON.stringify(list, null, "  "));
    if (tract.terminal.output) {
      logger.info(">>> save encoding to " + tract.terminal.output);
      fs.writeFileSync(tract.terminal.output, JSON.stringify(list, null, 2), "utf8");
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await jo.relax();
  }

};
