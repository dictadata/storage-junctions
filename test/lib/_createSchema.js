/**
 * test/createSchema
 */
"use strict";

const storage = require("../../lib/index");
const { typeOf } = require("../../lib/types");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");

  var jo;
  try {
    if (tract.origin.options && typeof tract.origin.options.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }

    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.createSchema();
    if (typeOf(results) === 'object')
      logger.debug(JSON.stringify(results));
    else
      logger.warn("could not create storage schema: " + results);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
    process.exitCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

};