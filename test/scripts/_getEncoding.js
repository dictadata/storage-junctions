/**
 * test/getEncoding
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = async function (options) {

  logger.info(">>> create junction");
  var junction = storage.activate(options.source.smt);

  try {
    let encoding = await junction.getEncoding();
    if (encoding) {
      logger.debug(JSON.stringify(encoding));
      if (options.OutputFile) {
        fs.writeFileSync(options.OutputFile, JSON.stringify(encoding,null,"  "));
        logger.verbose(options.OutputFile);
      }
    }
    else
      logger.warn("storage schema does not exist!");

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
