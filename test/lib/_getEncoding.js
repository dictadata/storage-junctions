/**
 * test/getEncoding
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (options) {
  logger.info(">>> create junction");

  var j1;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);
    let encoding = await j1.getEncoding();
    if (typeof encoding === 'object') {
      logger.verbose(JSON.stringify(encoding));

      if (options.OutputFile) {
        fs.writeFileSync(options.OutputFile, JSON.stringify(encoding,null,"  "));
        logger.verbose(options.OutputFile);
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
