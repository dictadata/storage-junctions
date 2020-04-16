/**
 * test/getEncoding
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");

  var j1;
  try {
    j1 = await storage.activate(tract.origin.smt, tract.origin.options);
    let encoding = await j1.getEncoding();

    if (typeof encoding === 'object') {
      logger.debug(JSON.stringify(encoding));
      if (tract.outputFile) {
        logger.verbose(tract.outputFile);
        fs.writeFileSync(tract.outputFile, JSON.stringify(encoding,null,"  "));
      }
    }
    else
      logger.warn("storage schema was: " + encoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (j1) await j1.relax();
  }

};
