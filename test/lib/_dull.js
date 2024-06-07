/**
 * test/dull
 */
"use strict";

const _pev = require('./_process_events');
const _init = require('./_init');
const { Storage } = require('../../storage');
const { logger } = require('@dictadata/storage-lib');
const { output } = require('@dictadata/storage-lib/test');

module.exports = exports = async function (tract, compareValues = 2) {
  let retCode = 0;

  logger.info(">>> create junction");
  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.debug("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.debug("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);

    let results = await jo.dull(tract.origin.pattern);

    if (tract.terminal?.output)
      retCode = output(tract.terminal.output, results, compareValues);
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
