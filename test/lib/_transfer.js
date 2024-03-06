/**
 * test/_transfer
 *
 * stream data from datastore to datastore
 *
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const { Storage } = require("../../storage");
const { logger } = require("../../storage/utils");
const _compare = require("./_compare");
const fs = require('fs');
const stream = require('stream').promises;

/**
 * transfer function
 */
module.exports = exports = async function (tract, compareValues = 2) {
  let retCode = 0;

  var origin = tract.origin || {};
  var terminal = tract.terminal || {};
  var transforms = tract.transforms || [];
  if (!origin.options) origin.options = {};
  if (!terminal.options) terminal.options = {};

  var jo, jt;  // junctions origin, terminal
  try {
    /// check if origin encoding is in a file
    if (typeof origin.options?.encoding === "string") {
      let filename = origin.options.encoding;
      origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }

    /// create origin junction
    logger.info(">>> origin junction");
    jo = await Storage.activate(origin.smt, origin.options);

    /// get origin encoding
    logger.debug(">>> get origin encoding");
    let encoding = origin.options.encoding;
    if (!encoding && jo.capabilities.encoding) {
      let results = await jo.getEngram();  // load encoding from origin for validation
      encoding = results.data;
    }

    /// determine terminal encoding
    if (typeof terminal.options?.encoding === "string") {
      // read encoding from file
      let filename = terminal.options.encoding;
      terminal.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    else if (!terminal.options?.encoding) {
      // use origin encoding
      terminal.options.encoding = encoding;
    }

    if (!terminal.options?.encoding || transforms.length > 0) {
      // otherwise run some objects through transforms to create terminal encoding
      logger.verbose(">>> codify pipeline");
      let pipes = [];

      let options = Object.assign({
        max_read: origin.options?.max_read || 100,
        pattern: origin.pattern || {}
      });

      let reader = jo.createReader(options);
      // reader.on('error', (error) => {
      //   logger.error("_transfer reader: " + error.message);
      // });
      pipes.push(reader);

      for (let transform of transforms) {
        if (typeof transform.options?.encoding === "string") {
          // read encoding from file
          let filename = transform.options.encoding;
          transform.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
        }
        pipes.push(await jo.createTransform(transform.transform, transform));
      }

      let codify = await jo.createTransform("codify", terminal.options);
      pipes.push(codify);

      await stream.pipeline(pipes);
      terminal.options.encoding = codify.encoding;
    }

    if (typeof terminal.options.encoding !== "object")
      throw new Error("invalid terminal encoding");

    //logger.debug(">>> encoding results");
    //logger.debug(JSON.stringify(terminal.options.encoding.fields, null, " "));

    /// create terminal junction
    logger.debug("create the terminal");
    jt = await Storage.activate(terminal.smt, terminal.options);

    logger.debug("create terminal schema");
    if (jt.capabilities.encoding && !terminal.options.append) {
      logger.verbose(">>> createSchema");
      let results = await jt.createSchema();
      if (results.status !== 0)
        logger.info("could not create storage schema: " + results.message);
    }

    /// setup pipeline
    logger.info(">>> transfer pipeline");
    let pipes = [];

    // reader
    let reader = jo.createReader({ pattern: origin.pattern });
    reader.on('error', (error) => {
      logger.error("_transfer reader: " + error.message);
    });
    pipes.push(reader);

    // transforms
    for (let transform of transforms) {
      if (typeof transform.options?.encoding === "string") {
        // read encoding from file
        let filename = transform.options.encoding;
        transform.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
      }
      pipes.push(await jo.createTransform(transform.transform, transform));
    }

    // writer
    let writer = jt.createWriter({
      progress: (stats) => {
        console.log(stats.count);
      }
    });
    writer.on('error', (error) => {
      logger.error("_transfer writer: " + error.message);
    });
    pipes.push(writer);

    /// transfer data
    logger.verbose(">>> start transfer");
    await stream.pipeline(pipes);

    /// check results
    if (terminal?.output) {
      logger.info("<<< compare results " + terminal.output);
      let expected_output = terminal.output.replace("output", "expected");
      retCode = _compare(expected_output, terminal.output, compareValues);
    }

    logger.info(">>> completed");
    let stats = writer.statistics;
    logger.info(stats.count + " in " + stats.elapsed / 1000 + "s, " + Math.round(stats.count / (stats.elapsed / 1000)) + "/sec");
  }
  catch (err) {
    logger.error(`!!! transfer failed: ${err.status} ${err.message}`);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
    if (jt) await jt.relax();
  }

  return process.exitCode = compareValues < 0 ? 0 : retCode;
};
