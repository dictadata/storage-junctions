/**
 * test/retrieve
 */
"use strict";

const _pev = require("./_process_events");
const _compare = require("./_compare");
const storage = require("../../storage");
const { logger } = require('../../storage/utils');
const fs = require('fs');
const path = require('path');

module.exports = exports = async function (tract, compareValues = 2) {
  logger.info(">>> create junction");
  let retCode = 0;

  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));
  if (!tract.terminal) tract.terminal = {};

  var jo;
  try {
    if (tract.origin.options && typeof tract.origin.options.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }

    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.retrieve(tract.origin.pattern);

    logger.verbose("result: " + results.resultCode + " count: " + (results.data ? results.data.length : 0));
    if (tract.terminal && tract.terminal.output) {
      logger.info("<<< save results to " + tract.terminal.output);
      fs.mkdirSync(path.dirname(tract.terminal.output), { recursive: true });
      fs.writeFileSync(tract.terminal.output, JSON.stringify(results, null, "  "), "utf8");

      let expected_output = tract.terminal.output.replace("output", "expected");
      retCode = _compare(tract.terminal.output, expected_output, compareValues);
    }
    else
      logger.verbose(JSON.stringify(results, null, "  "));

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
