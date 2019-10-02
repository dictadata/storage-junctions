/**
 * test/store
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

module.exports = async function (options) {

  logger.info(">>> create junction");
  var junction = storage.activate(options.src_smt);

  try {
    let results = await junction.store(options.construct, options.options);
    logger.info(results);

    logger.info(">>> completed");
    return results.key ? results.key : null;
  }
  catch (err) {
    if (err.statusCode < 500)
      logger.warn(err.message);
    else
      logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
