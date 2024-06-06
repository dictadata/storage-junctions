/**
 * test/codify
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const { Storage } = require("../../storage");
const { logger } = require("@dictadata/lib");
const { output } = require("@dictadata/lib/test");
const stream = require('node:stream').promises;

module.exports = exports = async function (fiber, compareValues = 2) {
  logger.verbose(">>> create junction");

  if (!Object.hasOwn(fiber, "transforms"))
    fiber.transforms = [];

  let retCode = 0;

  var jo;
  try {
    jo = await Storage.activate(fiber.origin.smt, fiber.origin.options);
    /*
        if (jo.capabilities.encoding) {
          logger.verbose(">>> get encoding");
          // *** get encoding for junction's schema
          let results = await jo.getEngram();
          let encoding = results.data;
          //logger.debug(JSON.stringify(encoding, null, "  "));

          let filename = fiber.terminal.output.replace(".json", ".engram.json");
          let retCode = output(filename, encoding || results, compareValues);
          if (retCode)
            return process.exitCode = 1;
        }
    */
    // *** otherwise use CodifyTransform to determine field types including transforms
    logger.verbose(">>> build codify pipeline");
    let pipes = [];

    let options = Object.assign({ max_read: 100 }, fiber.origin.options);

    let reader = jo.createReader(options);
    reader.on('error', (error) => {
      logger.error("_codify reader: " + error.message);
    });
    pipes.push(reader);

    for (let transform of fiber.transforms)
      pipes.push(await jo.createTransform(transform.transform, transform));

    // if fiber.encoding is specified use it as a seed encoding
    let codify = await jo.createTransform("codify", fiber);
    pipes.push(codify);

    // run the pipeline and get the resulting encoding
    logger.verbose(">>> start pipeline");
    await stream.pipeline(pipes);

    // save the codify results
    let encoding2 = codify.encoding;
    encoding2.name = jo.engram.name || jo.smt.schema;
    encoding2.smt = jo.smt;

    //logger.debug(JSON.stringify(encoding2, null, "  "));
    let filename = fiber.terminal.output.replace(".json", ".engram.json");
    retCode = output(filename, encoding2, compareValues);

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
