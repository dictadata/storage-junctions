/**
 * test/tee
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const { Storage } = require("../../storage");
const { logger } = require("@dictadata/lib");
const { compare } = require("@dictadata/lib/test");

const fs = require('node:fs');
const { finished } = require('node:stream/promises');

/**
 * tee function
 */
module.exports = exports = async function (tract) {
  let retCode = 0;

  var jo;
  var jts= [];
  try {
    let reader = null;
    let transforms = [];
    let writers = [];

    logger.info(">>> create origin junction");
    const origin_transforms = tract.transforms || [];

    if (typeof tract.origin?.options?.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);

    logger.debug(">>> get origin encoding");
    let encoding;
    if (jo.capabilities.encoding) {
      let results = await jo.getEngram();
      encoding = results.data;
    }

    logger.info(">>> create reader");
    reader = jo.createReader({ pattern: tract.origin.pattern });
    reader.on('error', (error) => {
      logger.error("_tee reader: " + error.message);
    });

    logger.info(">>> create transforms");
    for (let transform of origin_transforms)
      transforms.push(await jo.createTransform(transform.transform, transform));

    if (!Array.isArray(tract.terminals))
      throw new StorageError("tract.terminal not an Array");

    for (const terminal of tract.terminals) {

      logger.info(">>> create terminal junction");
      if (typeof terminal?.options?.encoding === "string") {
        // read encoding from file
        let filename = terminal.options.encoding;
        terminal.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
      }
      let jt = await Storage.activate(terminal.smt, terminal.options);
      if (jt.capabilities.encoding)
        await jt.createSchema();

      jts.push(jt);  // save reference to terminal junctions

      // add terminal
      let writer = jt.createWriter();
      writer.on('error', (error) => {
        logger.error("_tee writer: " + error.message);
      });
      writers.push(writer);
    }

    logger.info(">>> start pipelines");
    let pipe = reader;
    for (let transform of transforms)
      pipe = pipe.pipe(transform);
    for (let writer of writers)
      pipe.pipe(writer)

    await finished(reader);
    for (let writer of writers)
      await finished(writer);

    /// check results
    for (const terminal of tract.terminals) {
      if (terminal?.output) {
        logger.info("<<< compare results " + terminal.output);
        let expected_output = terminal.output.replace("output", "expected");
        retCode = compare(terminal.output, expected_output, 2);
      }
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo)
      await jo.relax();
    for (let j of jts)
      await j.relax();
  }

  return process.exitCode = retCode;
};
