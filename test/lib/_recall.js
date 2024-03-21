/**
 * test/recall
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const _output = require("./_output");
const { Storage } = require("../../storage");
const { logger } = require('../../storage/utils');
const fs = require('node:fs');
const path = require('node:path');

module.exports = exports = async function (tract, compareValues = 2) {
  logger.info(">>> create junction");
  let retCode = 0;

  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    if (typeof tract.origin?.options?.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.recall(tract.origin.pattern);

    if (tract.terminal?.output)
      retCode = _output(tract.terminal.output, results, compareValues);
    else
      logger.verbose(JSON.stringify(results, null, "  "));

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

  return process.exitCode = retCode;
};
