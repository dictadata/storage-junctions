/**
 * test/list
 */
"use strict";

const _pev = require("./_process_events");
const _compare = require("./_compare");
const storage = require("../../storage");
const { logger } = require('../../storage/utils');
const fs = require('fs');
const path = require('path');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");
  let retCode = 0;

  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (!tract.terminal) tract.terminal = {};

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    logger.info(">>> list");
    let { data: list } = await jo.list();

    logger.verbose(JSON.stringify(list, null, "  "));
    if (tract.terminal && tract.terminal.output) {
      logger.info("<<< saving list to " + tract.terminal.output);
      fs.mkdirSync(path.dirname(tract.terminal.output), { recursive: true });
      fs.writeFileSync(tract.terminal.output, JSON.stringify(list, null, 2), "utf8");

      let expected_output = tract.terminal.output.replace("output", "expected");
      retCode = _compare(tract.terminal.output, expected_output, false);
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo)
      await jo.relax();
  }

  return process.exitCode = retCode;
};
