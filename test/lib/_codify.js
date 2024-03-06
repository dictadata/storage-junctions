/**
 * test/codify
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const _output = require("./_output");
const { Storage } = require("../../storage");
const { logger, hasOwnProperty } = require('../../storage/utils');
const stream = require('stream').promises;

module.exports = exports = async function (tract, compareValues = 2) {
  logger.verbose(">>> create junction");

  if (!hasOwnProperty(tract, "transforms"))
    tract.transforms = [];

  let retCode = 0;

  var jo;
  try {
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);
/*
    if (jo.capabilities.encoding) {
      logger.verbose(">>> get encoding");
      // *** get encoding for junction's schema
      let results = await jo.getEngram();
      let encoding = results.data;
      //logger.debug(JSON.stringify(encoding, null, "  "));

      let filename = tract.output.replace(".json", ".engram.json");
      let retCode = _output(filename, encoding || results, compareValues);
      if (retCode)
        return process.exitCode = 1;
    }
*/
    // *** otherwise use CodifyTransform to determine field types including transforms
    logger.verbose(">>> build codify pipeline");
    let pipes = [];

    let options = Object.assign({
      max_read: tract.origin?.options?.max_read || 100,
    });
    if (tract.origin.pattern)
      options[ "pattern" ] = tract.origin.pattern;

    let reader = jo.createReader(options);
    reader.on('error', (error) => {
      logger.error("_codify reader: " + error.message);
    });
    pipes.push(reader);

    for (let transform of tract.transforms)
      pipes.push(await jo.createTransform(transform.transform, transform));

    // if tract.encoding is specified use it as a seed encoding
    let codify = await jo.createTransform("codify", tract);
    pipes.push(codify);

    // run the pipeline and get the resulting encoding
    logger.verbose(">>> start pipeline");
    await stream.pipeline(pipes);

    // save the codify results
    let encoding2 = codify.encoding;

    //logger.debug(JSON.stringify(encoding2, null, "  "));
    let filename = tract.output.replace(".json", ".results.json");
    retCode = _output(filename, encoding2, compareValues);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

  return process.exitCode = retCode;
};
