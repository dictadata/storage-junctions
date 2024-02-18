/**
 * test/getEngram
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const _output = require("./_output");
const { Storage } = require("../../storage");
const { typeOf } = require("../../storage/utils");
const { logger } = require('../../storage/utils');
const fs = require('fs');
const path = require('path');

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
        retCode = _output(tract.terminal.output, results.data, compareValues);
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
