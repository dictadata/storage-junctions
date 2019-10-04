/**
 * test/retrieve
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose(options.source.smt);
  logger.verbose(JSON.stringify(options.source.options));
  var junction = storage.activate(options.source.smt);

  try {
    let results = await junction.retrieve(options.source.options);
    logger.verbose("result: " + results.result + " count: " + results.data.length );

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
