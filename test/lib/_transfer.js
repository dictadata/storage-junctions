/**
 * test/transfer
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

const fs = require('fs');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);

/**
 * transfer fucntion
 */
module.exports = exports = async function (tract) {

  var j1, j2;
  try {
    logger.info(">>> create junctions");
    j1 = await storage.activate(tract.origin.smt, tract.origin.options);
    j2 = await storage.activate(tract.terminal.smt, tract.terminal.options);
    let transforms = tract.transforms || {};

    // load encoding from origin for validation
    logger.debug(">>> get origin encoding");
    let encoding = tract.origin.encoding;
    if (typeof encoding === "string")
      encoding = JSON.parse(fs.readFileSync(encoding, "utf8"));
    if (typeof encoding === "object")
      encoding = j1.putEncoding(encoding);
    else
      encoding = await j1.getEncoding();

    if (tract.terminal.encoding) {
      // use configured encoding
      encoding = tract.terminal.encoding;
      if (typeof encoding === "string")
        encoding = JSON.parse(fs.readFileSync(encoding, "utf8"));
    }
    else {
      // run some objects through any transforms to get terminal encoding
      logger.verbose("build codify pipeline");
      let pipes = [];
      pipes.push(j1.getReadStream({ max_read: 100 }));
      for (let [tfType,tfOptions] of Object.entries(transforms))
        pipes.push(j1.getTransform(tfType, tfOptions));
      let ct = j1.getTransform('codify');
      pipes.push(ct);
      await pipeline(pipes);
      encoding = await ct.getEncoding();
    }
    logger.debug(">>> encoding results");
    logger.debug(JSON.stringify(encoding.fields, null, " "));

    // attempt to create the terminal
    logger.verbose(">>> put terminal encoding");
    encoding = await j2.putEncoding(encoding);
    if (typeof encoding !== "object")
      logger.info("could not create storage schema: " + encoding);

    // transfer the data
    logger.info(">>> transfer pipeline");
    let pipes = [];
    pipes.push(j1.getReadStream());
    for (let [tfType,tfOptions] of Object.entries(transforms))
      pipes.push(j1.getTransform(tfType, tfOptions));
    pipes.push(j2.getWriteStream());
    await pipeline(pipes);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! transfer failed: ' + err.message);
  }
  finally {
    if (j1) await j1.relax();
    if (j2) await j2.relax();
  }

};
