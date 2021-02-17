/**
 * test/getEncoding
 */
"use strict";

const storage = require("../../lib/index");
const { typeOf } = require("../../lib/types");
const logger = require('../../lib/logger');
const fs = require('fs');
const path = require('path');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");
  if (!tract.terminal) tract.terminal = {};

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let encoding = await jo.getEncoding();

    if (typeOf(encoding) === 'object') {
      logger.debug(JSON.stringify(encoding));
      if (tract.terminal && tract.terminal.output) {
        logger.verbose("<<< " + tract.terminal.output);
        fs.mkdirSync(path.dirname(tract.terminal.output), { recursive: true });
        fs.writeFileSync(tract.terminal.output, JSON.stringify(encoding, null, "  "));
      }
    }
    else
      logger.warn("storage schema was: " + encoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
    process.exitCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

};
