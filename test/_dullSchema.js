/**
 * test/list
 */
"use strict";

const _pev = require('@dictadata/lib/test');
const _auth = require('./_auth');
const { Storage } = require('../storage');
const { logger } = require('@dictadata/lib');
const fs = require('node:fs');
const path = require('node:path');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");
  let retCode = 0;

  if (tract.origin)
    tract = tract.origin;

  logger.verbose("smt:" + JSON.stringify(tract.smt, null, 2));
  if (tract.options) logger.verbose("options:" + JSON.stringify(tract.options));

  var jo;
  try {
    jo = await Storage.activate(tract.smt, tract.options);
    logger.info(">>> dullSchema");
    let results = await jo.dullSchema();
    logger.info(JSON.stringify(results));
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 0;
  }
  finally {
    if (jo)
      await jo.relax();
  }

  return process.exitCode = retCode;
};
