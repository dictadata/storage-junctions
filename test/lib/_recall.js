/**
 * test/recall
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + options.source.smt);
  if (options.source.options) logger.verbose("options:" + JSON.stringify(options.source.options));
  if (options.source.pattern) logger.verbose("pattern: " + JSON.stringify(options.source.pattern));

  var j1;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);

    let results = await j1.recall(options.source.pattern);
    logger.verbose(JSON.stringify(results));

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (j1) await j1.relax();
  }

};
