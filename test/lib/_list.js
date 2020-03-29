/**
 * test/list
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (options) {

  logger.info(">>> create junction");
  logger.verbose("smt:" + options.source.smt);
  if (options.source.options) logger.verbose("options:" + JSON.stringify(options.source.options));

  var j1;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);
    logger.info(">>> list");
    let list = await j1.list();

    logger.debug("list: " + JSON.stringify(list, null, "  "));
    if (options.outputFile) {
      logger.info(">>> save encoding to " + options.outputFile);
      fs.writeFileSync(options.outputFile, JSON.stringify(list,null,"  "), "utf8");
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await j1.relax();
  }

};
