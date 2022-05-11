/**
 * test/transfer
 */
"use strict";

const _pev = require("./_process_events");
const Storage = require("../../storage");
const { typeOf, logger } = require("../../storage/utils");
const _compare = require("./_compare");
const fs = require('fs');
const stream = require('stream/promises');

/**
 * transfer function
 */
module.exports = exports = async function (tract, compareValues = 2) {
  let retCode = 0;

  var jo, jt;  // junctions origin, terminal
  try {
    if (!tract.origin.options) tract.origin.options = {};
    if (!tract.terminal.options) tract.terminal.options = {};
    const transforms = tract.transform || tract.transforms || {};

    if (tract.origin.options && typeof tract.origin.options.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }

    logger.info(">>> origin junction");
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);

    logger.debug(">>> get origin encoding");
    let encoding;
    if (jo.capabilities.encoding) {
      let results = await jo.getEncoding();  // load encoding from origin for validation
      encoding = results.data[ "encoding" ];
    }

    if (tract.terminal.options && typeof tract.terminal.options.encoding === "string") {
      // read encoding from file
      let filename = tract.terminal.options.encoding;
      tract.terminal.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    else if (!encoding || Object.keys(transforms).length > 0) {
      // otherwise run some objects through any transforms to get terminal encoding
      logger.verbose(">>> codify pipeline");
      let pipes = [];

      let options = Object.assign({
        max_read: (tract.origin.options && tract.origin.options.max_read) || 100
      }, tract.origin.pattern);

      let reader = jo.createReader(options);
      reader.on('error', (error) => {
        logger.error("_transfer reader: " + error.message);
      });
      pipes.push(reader);

      for (let [ tfType, tfOptions ] of Object.entries(transforms))
        pipes.push(await jo.createTransform(tfType, tfOptions));

      let codify = await jo.createTransform('codify');
      pipes.push(codify);

      await stream.pipeline(pipes);
      tract.terminal.options.encoding = codify.encoding;
    }
    else
      tract.terminal.options.encoding = encoding;

    if (typeof tract.terminal.options.encoding !== "object")
      throw new Error("invalid encoding");

    logger.debug(">>> encoding results");
    //logger.debug(JSON.stringify(tract.terminal.options.encoding.fields, null, " "));

    logger.debug("create the terminal");
    jt = await Storage.activate(tract.terminal.smt, tract.terminal.options);
    if (jt.capabilities.encoding) {
      let results = await jt.createSchema();
      if (results.resultCode !== 0)
        logger.info("could not create storage schema: " + results.resultText);
    }

    // transfer the data
    logger.info(">>> transfer pipeline");
    let pipes = [];

    let options = Object.assign({}, tract.origin.pattern);
    let reader = jo.createReader(options);
    reader.on('error', (error) => {
      logger.error("_transfer reader: " + error.message);
    });
    pipes.push(reader);

    for (let [ tfType, tfOptions ] of Object.entries(transforms))
      pipes.push(await jo.createTransform(tfType, tfOptions));

    let tws = jt.createWriter({
      progress: (stats) => {
        console.log(stats.count);
      }
    });
    tws.on('error', (error) => {
      logger.error("_transfer writer: " + error.message);
    });

    pipes.push(tws);

    logger.verbose(">>> start transfer");
    await stream.pipeline(pipes);

    if (tract.terminal && tract.terminal.output) {
      logger.info("<<< compare results " + tract.terminal.output);
      let expected_output = tract.terminal.output.replace("output", "expected");
      retCode = _compare(expected_output, tract.terminal.output, compareValues);
    }

    logger.info(">>> completed");
    let stats = tws.statistics;
    logger.info(stats.count + " in " + stats.elapsed / 1000 + "s, " + Math.round(stats.count / (stats.elapsed / 1000)) + "/sec");
  }
  catch (err) {
    logger.error('!!! transfer failed: ' + err.message);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
    if (jt) await jt.relax();
  }

  return process.exitCode = retCode;
};
