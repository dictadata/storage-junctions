/**
 * test/storeBulk
 */
"use strict";

const _pev = require('@dictadata/lib/test');
const _auth = require('./_auth');
const { Storage } = require('../../storage');
const { logger } = require('@dictadata/lib');
const { output } = require('@dictadata/lib/test');

module.exports = exports = async function (tract, compareValues = 2, keyValues = null) {
  logger.info(">>> create junction");
  let retCode = 0;

  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options) logger.verbose("options:" + JSON.stringify(tract.origin.options));
  if (tract.origin.pattern) logger.verbose("pattern: " + JSON.stringify(tract.origin.pattern));

  var jo;
  try {
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.storeBulk(tract.constructs, tract.origin.pattern);

    if (tract.terminal?.output)
      retCode = output(tract.terminal.output, results, compareValues);
    else
      logger.verbose(JSON.stringify(results, null, "  "));

    logger.info(">>> completed");
    // check for a returnd keystore UniqueID value
    if (keyValues && results.data && !Array.isArray(results.data)) {
      keyValues.uid = Object.keys(results.data)[ 0 ];
    }
  }
  catch (err) {
    if (err.statusCode < 500)
      logger.warn(err.message);
    else {
      logger.error('!!! request failed: ' + err.status + " " + err.message);
      retCode = 1;
    }
  }
  finally {
    if (jo) await jo.relax();
  }

  return process.exitCode = retCode;
};
