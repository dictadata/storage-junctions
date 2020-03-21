/**
 * test/putEncoding
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = exports = async function (options) {

  logger.info(">>> create junction");
  var junction = storage.activate(options.source.smt, options.source.options);

  let filename = "./test/data/" + (options.source.filename || "foo_encoding.json");

  try {
    let encoding = JSON.parse(fs.readFileSync(filename, "utf8"));

    let newencoding = await junction.putEncoding(encoding);
    if (typeof newencoding === 'object')
      logger.verbose(JSON.stringify(newencoding));
    else
      logger.warn("could not create storage schema: " + newencoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
