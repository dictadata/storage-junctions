/**
 * test/list
 */
"use strict";

const _process = require("./_process");
const storage = require("../../lib/index");
const logger = require('../../lib/logger');
const fs = require('fs');
const path = require('path');

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

    logger.verbose(JSON.stringify(list, null, "  "));
    if (tract.terminal && tract.terminal.output) {
      logger.info("<<< save encoding to " + tract.terminal.output);
      fs.mkdirSync(path.dirname(tract.terminal.output), { recursive: true });
      fs.writeFileSync(tract.terminal.output, JSON.stringify(list, null, 2), "utf8");
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
    process.exitCode = 1;
  }
  finally {
    await jo.relax();
  }

};
