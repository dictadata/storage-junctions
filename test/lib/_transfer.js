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
module.exports = exports = async function (config) {

  var j1, j2;
  try {
    logger.info(">>> create junctions");
    j1 = await storage.activate(config.source.smt, config.source.options);
    j2 = await storage.activate(config.destination.smt, config.destination.options);
    let transforms = config.transforms || {};

    logger.debug(">>> get source encoding (codify)");
    //let encoding = await j1.getEncoding();

    // build codify pipeline
    let pipe1 = [];
    pipe1.push(j1.getReadStream({ max_read: 100 }));
    for (let [tfType,tfOptions] of Object.entries(transforms))
      pipe1.push(j1.getTransform(tfType, tfOptions));
    let cf = j1.getCodifyWriter();
    pipe1.push(cf);

    // run the pipeline and get the resulting encoding
    await pipeline(pipe1);
    let encoding = await cf.getEncoding();

    logger.debug(">>> encoding results");
    logger.debug(JSON.stringify(encoding.fields, null, " "));

    logger.verbose(">>> put destination encoding");
    let result_encoding = await j2.putEncoding(encoding);
    if (!result_encoding)
      logger.info("could not create storage schema, maybe it already exists");

    logger.info(">>> create pipeline");
    let pipe2 = [];
    pipe2.push(j1.getReadStream({ max_read: 100 }));
    for (let [tfType,tfOptions] of Object.entries(transforms))
      pipe1.push(j1.getTransform(tfType, tfOptions));
    pipe2.push(j2.getWriteStream());

    logger.info(">>> start pipe");
    await pipeline(pipe2);

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
