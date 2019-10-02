/**
 * test/transfer
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

const stream = require('stream');
const util = require('util');
const fs = require('fs');

const pipeline = util.promisify(stream.pipeline);

module.exports = async function (options) {

  logger.info(">>> create junction");
  var j1 = storage.activate(options.src_smt);

  try {
    // *** the normal way is to ask the junction to do it
    logger.info(">>> getEncoding");
    let encoding1 = await j1.getEncoding();
    logger.debug(JSON.stringify(encoding1, null, "  "));

    logger.info(">>> save encoding to output/codify_encoding1.json");
    fs.writeFileSync('./test/output/codify_encoding1.json', JSON.stringify(encoding1), "utf8");

    // *** stream some data to the codifier
    logger.info(">>> create streams");
    var reader = j1.getReadStream({ codify: true, max_read: 1000 });
    var codify = j1.getCodifyTransform();

    logger.info(">>> start pipe");
    await pipeline(reader, codify);

    let encoding2 = await codify.getEncoding();
    logger.debug(JSON.stringify(encoding2, null, "  "));

    logger.info(">>> save encoding to output/codify_encoding2.json");
    fs.writeFileSync('./test/output/codify_encoding2.json', JSON.stringify(encoding2), "utf8");

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await j1.relax();
  }

};
