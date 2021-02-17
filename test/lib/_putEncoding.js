/**
 * test/putEncoding
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
    jo = await storage.activate(tract.origin.smt, tract.origin.options);

    let filename = (tract.origin.encoding || "./test/data/encoding_foo.json");
    let encoding = JSON.parse(fs.readFileSync(filename, "utf8"));

    let results = await jo.putEncoding(encoding);
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
