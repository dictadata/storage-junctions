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
  logger.info(">>> create junction");

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

    // *** get encoding for junction's schema
    logger.info(">>> get encoding");
    let results = await jo.getEncoding();
    let encoding1 = results.data[ "encoding" ];

    //logger.debug(JSON.stringify(encoding1, null, "  "));
    if (tract.outputFile1) {
      logger.info("<<< save encoding to " + tract.outputFile1);
      fs.mkdirSync(path.dirname(tract.outputFile1), { recursive: true });
      fs.writeFileSync(tract.outputFile1, JSON.stringify(encoding1, null, 2), "utf8");

      let expected_output = tract.outputFile1.replace("output", "expected");
      if (_compare(expected_output, tract.outputFile1, compareValues))
        return process.exitCode = 1;
    }

    // *** use CodifyTransform to determine encoding including optional transforms
    logger.info(">>> build pipeline");
    let pipes = [];
    pipes.push(jo.createReader({ max_read: (tract.origin.options && tract.origin.options.max_read) || 100 }));
    for (let [ tfType, tfOptions ] of Object.entries(tract.transform))
      pipes.push(jo.createTransform(tfType, tfOptions));
    let codify = jo.createTransform('codify', tract.origin);
    pipes.push(codify);

    // run the pipeline and get the resulting encoding
    logger.info(">>> start pipeline");
    await stream.pipeline(pipes);

    // save the codify results
    let encoding2 = codify.encoding;

    //logger.debug(JSON.stringify(encoding2, null, "  "));
    if (tract.outputFile2) {
      logger.info("<<< save encoding to " + tract.outputFile2);
      fs.mkdirSync(path.dirname(tract.outputFile2), { recursive: true });
      fs.writeFileSync(tract.outputFile2, JSON.stringify(encoding2, null, "  "), "utf8");

      let expected_output = tract.outputFile2.replace("output", "expected");
      retCode = _compare(expected_output, tract.outputFile2, compareValues);
    }

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
