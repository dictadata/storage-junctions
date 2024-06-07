/**
 * test/list
 */
"use strict";

const _pev = require('./_process_events');
const _init = require('./_init');
const { Storage } = require('../../storage');
const { logger } = require('@dictadata/storage-lib');
const { output } = require('@dictadata/storage-lib/test');
const fs = require('node:fs');
const path = require('node:path');

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
    if (tract.terminal?.output)
      retCode = output(tract.terminal.output, list, compareValues);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo)
      await jo.relax();
  }

  return process.exitCode = retCode;
};
