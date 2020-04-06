/**
 * test/retrieve
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger').test();
const fs = require('fs');

module.exports = exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + options.source.smt);
  if (options.source.options) logger.verbose("options:" + JSON.stringify(options.source.options));
  if (options.source.pattern) logger.verbose("pattern: " + JSON.stringify(options.source.pattern));

  var j1;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);

    let results = await j1.retrieve(options.source.pattern);

    logger.verbose("result: " + results.result + " count: " + (results.data ? results.data.length : 0) );
    logger.debug(JSON.stringify(results));
    if (options.outputFile) {
      logger.info(">>> save results to " + options.outputFile);
      fs.writeFileSync(options.outputFile, JSON.stringify(results, null,"  "), "utf8");
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (j1) await j1.relax();
  }

};
