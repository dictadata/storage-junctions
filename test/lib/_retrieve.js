/**
 * test/retrieve
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose(options.source.smt);
  logger.verbose("options: " + JSON.stringify(options.source.options));
  var junction = storage.activate(options.source.smt, options.source.options);

  try {
    let results = await junction.retrieve(options.source.pattern);
    logger.verbose("result: " + results.result + " count: " + (results.data ? results.data.length : 0) );
    logger.verbose(JSON.stringify(results));

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
