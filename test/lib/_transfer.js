/**
 * test/transfer
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

/**
 * transfer fucntion
 */
module.exports = exports = async function (options) {

  logger.info(">>> create junctions");

  var j1, j2;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);
    j2 = await storage.activate(options.destination.smt, options.destination.options);

    logger.info(">>> get source encoding (codify)");
    let encoding = await j1.getEncoding();

    logger.debug(">>> encoding results:");
    logger.debug(JSON.stringify(encoding));

    logger.info(">>> put destination encoding");
    let result_encoding = await j2.putEncoding(encoding);
    if (!result_encoding)
      logger.warn("could not create storage schema, maybe it already exists");

    logger.info(">>> create streams");
    var reader = j1.getReadStream();
    var writer = j2.getWriteStream();

    logger.info(">>> start pipe");
    await pipeline(reader, writer);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (j1) await j1.relax();
    if (j2) await j2.relax();
  }

};
