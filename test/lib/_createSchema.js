/**
 * test/createSchema
 */
"use strict";

const _pev = require('./_process_events');
const _init = require('./_init');
const { Storage } = require('../../storage');
const { logger } = require('@dictadata/lib');
const fs = require('node:fs');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");
  let retCode = 0;

  var jo;
  try {
    if (typeof tract.origin?.options?.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }

    jo = await Storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.createSchema();
    logger.verbose(JSON.stringify(results));
    if (results.status !== 0)
      logger.warn("could not create storage schema: " + results.message);
    if (results.status === 409)
      retCode = -1; // already exists

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

  if (retCode > 0)
    process.exitCode = retCode;
  return retCode;
};
