/**
 * test/getEncoding
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let encoding = await jo.getEncoding();

    if (typeof encoding === 'object') {
      logger.debug(JSON.stringify(encoding));
      if (tract.terminal) {
        logger.verbose(tract.terminal);
        fs.writeFileSync(tract.terminal, JSON.stringify(encoding,null,"  "));
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
    if (jo) await jo.relax();
  }

};
