/**
 * test/getEngram
 */
"use strict";

const _pev = require('./_process_events');
const _init = require('./_init');
const { Storage } = require('../../storage');
const { logger } = require('@dictadata/lib');
const { typeOf } = require('@dictadata/lib/utils');
const { output } = require('@dictadata/lib/test');

const fs = require('node:fs');
const path = require('node:path');

module.exports = exports = async function (tract, compareValues = 2) {
  logger.info(">>> create junction");
  if (!tract.terminal) tract.terminal = {};
  let retCode = 0;

  var jo;
  try {
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.getEngram();
    let encoding = results.data;
    //logger.debug(JSON.stringify(encoding));

    if (typeOf(encoding) === 'object') {
      if (tract.terminal?.output)
        retCode = output(tract.terminal.output, results.data, compareValues);
    }
    else
      logger.warn("storage schema was: " + encoding);

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
