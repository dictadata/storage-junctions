/**
 * test/getEncoding
 */
"use strict";

const _pev = require("./_process_events");
const _compare = require("./_compare");
const storage = require("../../storage");
const { typeOf } = require("../../storage/utils");
const logger = require('../../storage/logger');
const fs = require('fs');
const path = require('path');

module.exports = exports = async function (tract, compareValues = true) {
  logger.info(">>> create junction");
  if (!tract.terminal) tract.terminal = {};
  let retCode = 0;

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.getEncoding();
    let encoding = results.data["encoding"];

    if (typeOf(encoding) === 'object') {
      logger.debug(JSON.stringify(encoding));
      if (tract.terminal && tract.terminal.output) {
        logger.verbose("<<< " + tract.terminal.output);
        fs.mkdirSync(path.dirname(tract.terminal.output), { recursive: true });
        fs.writeFileSync(tract.terminal.output, JSON.stringify(encoding, null, "  "));

        let expected_output = tract.terminal.output.replace("output", "expected");
        retCode = _compare(tract.terminal.output, expected_output, compareValues);
      }
    }
    else
      logger.warn("storage schema was: " + encoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

  return process.exitCode = retCode;
};
