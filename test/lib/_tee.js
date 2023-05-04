/**
 * test/tee
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const Storage = require("../../storage");
const { typeOf } = require("../../storage/utils");
const { logger } = require('../../storage/utils');

const fs = require('fs');
const { finished } = require('stream/promises');

/**
 * tee function
 */
module.exports = exports = async function (tract) {
  let retCode = 0;

  var jo;
  var jtlist = [];
  try {
    let reader = null;
    let writers = [];

    logger.info(">>> create origin junction");
    const origin_transforms = tract.transform || tract.transforms || {};

    if (typeof tract.origin?.options?.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);

    logger.debug(">>> get origin encoding");
    let encoding;
    if (jo.capabilities.encoding) {
      let results = await jo.getEncoding();
      encoding = results.data;
    }

    logger.info(">>> create origin pipeline");
    reader = jo.createReader({ pattern: tract.origin.pattern });
    reader.on('error', (error) => {
      logger.error("_tee reader: " + error.message);
    });

    for (let [ tfType, tfOptions ] of Object.entries(origin_transforms))
      reader = reader.pipe(await jo.createTransform(tfType, tfOptions));

    logger.info(">>> create terminal branches");
    if (!Array.isArray(tract.terminal))
      throw new Error("tract.terminal not an Array");

    for (const branch of tract.terminal) {
      const transforms = branch.transform || branch.transforms || {};

      logger.info(">>> create branch junction");
      if (typeof branch.terminal?.options?.encoding === "string") {
        // read encoding from file
        let filename = branch.terminal.options.encoding;
        branch.terminal.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
      }
      let jt = await Storage.activate(branch.terminal.smt, branch.terminal.options);
      if (jt.capabilities.encoding)
        await jt.createSchema();

      jtlist.push(jt);  // save reference to branch junctions

      logger.info(">>> create branch pipeline");
      let writer = null;
      // add transforms
      for (let [ tfType, tfOptions ] of Object.entries(transforms)) {
        let t = await jt.createTransform(tfType, tfOptions);
        writer = (writer) ? writer.pipe(t) : reader.pipe(t);
      }
      // add terminal
      let w = jt.createWriter();
      w.on('error', (error) => {
        logger.error("_tee writer: " + error.message);
      });

      writer = (writer) ? writer.pipe(w) : reader.pipe(w);
      writers.push(writer);
    }

    logger.info(">>> wait on pipelines");
    await finished(reader);
    for (let writer of writers)
      await finished(writer);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo)
      await jo.relax();
    for (let j of jtlist)
      await j.relax();
  }

  return process.exitCode = retCode;
};
