/**
 * test/list
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const _compare = require("./_compare");
const Storage = require("../../storage");
const { logger } = require('../../storage/utils');
const fs = require('fs');
const path = require('path');

module.exports = exports = async function (tract, compareValues = 1) {
  logger.info(">>> create junction");
  let retCode = 0;

  logger.verbose("smt:" + JSON.stringify(tract.origin.smt));
  if (tract.origin.options)
    logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (!tract.terminal)
    tract.terminal = {};

  var jo;
  try {
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);
    logger.info(">>> list");
    let response = await jo.list();
    let list = response.data;

    //logger.verbose(JSON.stringify(list, null, "  "));
    if (tract.terminal && tract.terminal.output) {
      logger.info("<<< saving list to " + tract.terminal.output);
      fs.mkdirSync(path.dirname(tract.terminal.output), { recursive: true });
      fs.writeFileSync(tract.terminal.output, JSON.stringify(list, null, 2), "utf8");

      let expected_output = tract.terminal.output.replace("output", "expected");
      retCode = _compare(expected_output, tract.terminal.output, compareValues);
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
