/**
 * test/recall
 */
"use strict";

const storage = require("../../lib/index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let pattern = tract.origin.pattern;

    let results = await jo.recall(pattern);
    logger.verbose(JSON.stringify(results));
    if (tract.terminal && tract.terminal.output) {
      logger.info(">>> save results to " + tract.terminal.output);
      fs.writeFileSync(tract.terminal.output, JSON.stringify(results, null, "  "), "utf8");
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (jo) await jo.relax();
  }

};
