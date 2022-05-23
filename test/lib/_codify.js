/**
 * test/codify
 */
"use strict";

const _pev = require("./_process_events");
const _compare = require("./_compare");
const Storage = require("../../storage");
const { logger, hasOwnProperty } = require('../../storage/utils');

const fs = require('fs');
const path = require('path');
//const stream = require('stream/promises');
const stream = require('stream').promises;

module.exports = exports = async function (tract, compareValues = 2) {
  logger.verbose(">>> create junction");

  if (!hasOwnProperty(tract, "transform")) {
    if (hasOwnProperty(tract, "transforms"))
      tract.transform = tract.transforms;  // tract.transforms is deprecated
    else
      tract.transform = {};
  }
  let retCode = 0;

  var jo;
  try {
    jo = await Storage.activate(tract.origin.smt, tract.origin.options);

    if (jo.capabilities.encoding) {
      logger.verbose(">>> get encoding");
      // *** get encoding for junction's schema
      let results = await jo.getEncoding();
      let encoding = results.data[ "encoding" ];

      //logger.debug(JSON.stringify(encoding1, null, "  "));
      let filename = tract.output.replace(".json", ".encoding.json");
      logger.info(">>> saving encoding to " + filename);
      fs.mkdirSync(path.dirname(filename), { recursive: true });
      fs.writeFileSync(filename, JSON.stringify(encoding, null, 2), "utf8");

      let expected_output = filename.replace("output", "expected");
      if (_compare(expected_output, filename, compareValues))
        return process.exitCode = 1;
    }

    // *** use CodifyTransform to determine encoding including transforms
    logger.verbose(">>> build codify pipeline");
    let pipes = [];

    let options = Object.assign({
      max_read: (tract.origin.options && tract.origin.options.max_read) || 100
    }, tract.origin.pattern);

    let reader = jo.createReader(options);
    reader.on('error', (error) => {
      logger.error("_codify reader: " + error.message);
    });
    pipes.push(reader);

    for (let [ tfType, tfOptions ] of Object.entries(tract.transform))
      pipes.push(await jo.createTransform(tfType, tfOptions));

    let codify = await jo.createTransform('codify', tract.origin);
    pipes.push(codify);

    // run the pipeline and get the resulting encoding
    logger.verbose(">>> start pipeline");
    await stream.pipeline(pipes);

    // save the codify results
    let encoding2 = codify.encoding;

    //logger.debug(JSON.stringify(encoding2, null, "  "));
    logger.info(">>> save encoding to " + tract.output);
    fs.mkdirSync(path.dirname(tract.output), { recursive: true });
    fs.writeFileSync(tract.output, JSON.stringify(encoding2, null, "  "), "utf8");

    let expected_output = tract.output.replace("output", "expected");
    retCode = _compare(expected_output, tract.output, compareValues);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
    retCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

  return process.exitCode = retCode;
};
