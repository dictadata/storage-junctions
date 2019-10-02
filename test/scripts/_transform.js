/**
 * test/transform
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');
const stream = require('stream');
const util = require('util');

const pipeline = util.promisify(stream.pipeline);

module.exports = async function (options) {

  logger.info(">>> create junctions");
  var j1 = storage.activate(options.src_smt, options.src_options);
  var j2 = storage.activate(options.dst_smt, options.dst_options);

  try {
    logger.debug(">>> get source encoding (codify)");
    var reader1 = j1.getReadStream({ codify: true, max_read: 1000 });
    var transform1 = j1.getTransform(options.transforms);
    let codify1 = j1.getCodifyTransform();

    logger.info(">>> start codify");
    await pipeline(reader1, transform1, codify1);
    let encoding = await codify1.getEncoding();

    logger.debug(">>> encoding results");
    logger.debug(JSON.stringify(encoding.fields));

    logger.debug(">>> put destination encoding");
    let result_encoding = await j2.putEncoding(encoding);
    if (!result_encoding)
      logger.info("could not create storage schema, maybe it already exists");

    logger.info(">>> create streams");
    var reader = j1.getReadStream();
    var transform = j1.getTransform(options.transforms);
    var writer = j2.getWriteStream();

    logger.info(">>> start pipe");
    await pipeline(reader, transform, writer);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await j1.relax();
    await j2.relax();
  }

};
