/**
 * test/retrieve
 */
"use strict";

const storage = require("../../lib/index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + tract.origin.smt);
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);

    let results = await jo.retrieve(tract.origin.pattern);

    logger.verbose("result: " + results.result + " count: " + (results.data ? results.data.length : 0) );
    logger.verbose(JSON.stringify(results));
    if (tract.terminal) {
      logger.info(">>> save results to " + tract.terminal);
      fs.writeFileSync(tract.terminal, JSON.stringify(results, null,"  "), "utf8");
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
