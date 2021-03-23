/**
 * test/tee
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../storage");
const { typeOf } = require("../../storage/types");
const logger = require('../../storage/logger');

const fs = require('fs');
const stream = require('stream/promises');

/**
 * tee function
 */
module.exports = exports = async function (tract) {

  var jo;
  var jtlist = [];
  try {
    let reader = null;
    let writers = [];

    logger.info(">>> create origin junction");
    const origin_transforms = tract.transforms || {};

    if (tract.origin.options && typeof tract.origin.options.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    jo = await storage.activate(tract.origin.smt, tract.origin.options);

    logger.debug(">>> get origin encoding");
    let encoding = await jo.getEncoding();

    logger.info(">>> create origin pipeline");
    reader = jo.createReadStream();
    for (let [tfType, tfOptions] of Object.entries(origin_transforms))
      reader = reader.pipe(jo.createTransform(tfType, tfOptions));

    logger.info(">>> create terminal branches");
    if (!Array.isArray(tract.terminal))
      throw new StorageError({ statusCode: 400 }, "tract.terminal not an Array");

    for (const branch of tract.terminal) {
      const transforms = branch.transforms || {};

      logger.info(">>> create branch junction");
      if (branch.terminal.options && typeof branch.terminal.options.encoding === "string") {
        // read encoding from file
        let filename = branch.terminal.options.encoding;
        branch.terminal.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
      }
      let jt = await storage.activate(branch.terminal.smt, branch.terminal.options);
      await jt.createSchema();

      jtlist.push(jt);  // save reference to branch junctions

      logger.info(">>> create branch pipeline");
      let writer = null;
      // add transforms
      for (let [tfType, tfOptions] of Object.entries(transforms)) {
        let t = jt.createTransform(tfType, tfOptions);
        writer = (writer) ? writer.pipe(t) : reader.pipe(t);
      }
      // add terminal
      let w = jt.createWriteStream();
      writer = (writer) ? writer.pipe(w) : reader.pipe(w);

      writers.push(writer);
    }

    logger.info(">>> wait on pipelines");
    await stream.finished(reader);
    for (let writer of writers)
      await stream.finished(writer);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
    process.exitCode = 1;
  }
  finally {
    if (jo)
      await jo.relax();
    for (let j of jtlist)
      await j.relax();
  }

};
