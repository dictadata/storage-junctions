/**
 * test/codify
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

const stream = require('stream');
const util = require('util');
const fs = require('fs');

const pipeline = util.promisify(stream.pipeline);

module.exports = exports = async function (options) {
  logger.info(">>> create junction");
  if (!options.transforms) options.transforms = {};

  var j1;
  try {
    j1 = await storage.activate(options.source.smt, options.source.options);

    // *** get encoding for junction's schema
    logger.info(">>> getEncoding");
    let encoding1 = await j1.getEncoding();

    logger.debug(JSON.stringify(encoding1, null, "  "));
    if (options.outputFile1) {
      logger.info(">>> save encoding to " + options.outputFile1);
      fs.writeFileSync(options.outputFile1, JSON.stringify(encoding1,null,"  "), "utf8");
    }

    // *** use CodifyTransform to determine encoding including optional transforms
    logger.info(">>> build pipeline");
    let pipes = [];
    pipes.push(j1.getReadStream({max_read: (options.source.options && options.source.options.max_read) || 100 }));
    for (let [tfType,tfOptions] of Object.entries(options.transforms))
      pipes.push(j1.getTransform(tfType, tfOptions));
    let codify = j1.getTransform('codify', options.codify ||{});
    pipes.push(codify);

    // run the pipeline and get the resulting encoding
    logger.info(">>> start pipeline");
    await pipeline(pipes);

    // save the codify results
    let encoding2 = await codify.getEncoding();

    logger.debug(JSON.stringify(encoding2, null, "  "));
    if (options.outputFile) {
      logger.info(">>> save encoding to " + options.outputFile2);
      fs.writeFileSync(options.outputFile2, JSON.stringify(encoding2,null,"  "), "utf8");
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (j1) await j1.relax();
  }

};
