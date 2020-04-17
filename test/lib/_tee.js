/**
 * test/tee
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

const fs = require('fs');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);
const finished = util.promisify(stream.finished);

/**
 * transfer fucntion
 */
module.exports = exports = async function (tract) {

  var jo;
  var jtl = [];
  try {
    let reader = null;
    let writers = [];

    logger.info(">>> create origin junction");
    let origin_transforms = tract.transforms || {};
    jo = await storage.activate(tract.origin.smt, tract.origin.options);

    logger.debug(">>> get origin encoding");
    let encoding = tract.origin.encoding;
    if (typeof encoding === "string")
      encoding = JSON.parse(fs.readFileSync(encoding, "utf8"));
    if (typeof encoding === "object")
      encoding = await jo.putEncoding(encoding);
    else
      encoding = await jo.getEncoding();

    logger.info(">>> create origin pipeline");
    reader = jo.getReadStream();
    for (let [tfType,tfOptions] of Object.entries(origin_transforms))
      reader = reader.pipe(jo.getTransform(tfType, tfOptions));

    logger.info(">>> create terminal pipeline(s)");
    if (!Array.isArray(tract.terminal))
      throw new Error("tract.terminal not an Array");

    for (let branch of tract.terminal) {
      let transforms = branch.transforms || {};

      logger.info(">>> create terminal junction");
      let jt = await storage.activate(branch.terminal.smt, branch.terminal.options);
      jtl.push(jt);

      logger.info(">>> put terminal encoding");
      if (branch.terminal.encoding)
        encoding = branch.terminal.encoding;
      if (typeof encoding === "string")
        encoding = JSON.parse(fs.readFileSync(encoding, "utf8"));
      encoding = await jt.putEncoding(encoding);

      logger.info(">>> create terminal tee");
      let writer = null;
      // add transforms
      for (let [tfType,tfOptions] of Object.entries(transforms)) {
        let t = jt.getTransform(tfType, tfOptions);
        writer = (writer) ? writer.pipe(t) : reader.pipe(t);
      }
      // add terminal
      let w = jt.getWriteStream();
      writer = (writer) ? writer.pipe(w) : reader.pipe(w);

      writers.push(writer);
    }

    logger.info(">>> wait on pipes");
    await finished(reader);
    for (let writer of writers)
      await finished(writer);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (jo)
      await jo.relax();
    for (let j of jtl)
      await j.relax();
  }

};
