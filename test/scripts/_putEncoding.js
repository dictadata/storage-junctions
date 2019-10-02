/**
 * test/putEncoding
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const fs = require('fs');

module.exports = async function (options) {

  logger.info(">>> create junction");
  var junction = storage.activate(options.src_smt);

  try {
    let encoding = JSON.parse(fs.readFileSync("./test/data/testencoding.json", "utf8"));

    let result_encoding = await junction.putEncoding(encoding);
    if (!result_encoding)
      logger.warn("could not create storage schema, maybe it already exists");

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
