/**
 * test/putEncoding
 */
"use strict";

const storage = require("../../lib/index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (tract) {

  logger.info(">>> create junction");

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);

    let filename = (tract.origin.encoding || "./test/data/foo_encoding.json");
    let encoding = JSON.parse(fs.readFileSync(filename, "utf8"));

    encoding = await jo.putEncoding(encoding);
    if (typeof encoding === 'object')
      logger.verbose(JSON.stringify(encoding));
    else
      logger.warn("could not create storage schema: " + encoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (jo) await jo.relax();
  }

};
