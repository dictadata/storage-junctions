/**
 * test/retrieve
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose(options.source.smt);
  logger.verbose("options: " + JSON.stringify(options.source.options));

  var j1;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);

    let results = await j1.retrieve(options.source.pattern);
    logger.verbose("result: " + results.result + " count: " + (results.data ? results.data.length : 0) );
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
