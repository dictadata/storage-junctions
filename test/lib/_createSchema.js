/**
 * test/createSchema
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../storage");
const { typeOf, logger } = require("../../storage/utils");
const fs = require('fs');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");
  let retCode = 0;

  var jo;
  try {
    if (tract.origin.options && typeof tract.origin.options.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }

    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.createSchema();
    if (results.resultCode !== 0)
      logger.warn("could not create storage schema: " + results.resultText);

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
