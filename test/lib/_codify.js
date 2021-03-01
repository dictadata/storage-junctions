/**
 * test/codify
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../lib/index");
const logger = require('../../lib/logger');

const fs = require('fs');
const path = require('path');
const stream = require('stream/promises');


module.exports = exports = async function (tract) {
  logger.info(">>> create junction");
  if (!tract.transforms) tract.transforms = {};

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);

    // *** get encoding for junction's schema
    logger.info(">>> get encoding");
    let encoding1 = await jo.getEncoding();

    logger.debug(JSON.stringify(encoding1, null, "  "));
    if (tract.outputFile1) {
      logger.info("<<< save encoding to " + tract.outputFile1);
      fs.mkdirSync(path.dirname(tract.outputFile1), { recursive: true });
      fs.writeFileSync(tract.outputFile1, JSON.stringify(encoding1, null, 2), "utf8");
    }

    // *** use CodifyTransform to determine encoding including optional transforms
    logger.info(">>> build pipeline");
    let pipes = [];
    pipes.push(jo.createReadStream({ max_read: (tract.origin.options && tract.origin.options.max_read) || 100 }));
    for (let [tfType, tfOptions] of Object.entries(tract.transforms))
      pipes.push(jo.createTransform(tfType, tfOptions));
    let codify = jo.createTransform('codify', tract.origin);
    pipes.push(codify);

    // run the pipeline and get the resulting encoding
    logger.info(">>> start pipeline");
    await stream.pipeline(pipes);

    // save the codify results
    let encoding2 = codify.encoding;

    logger.debug(JSON.stringify(encoding2, null, "  "));
    if (tract.outputFile2) {
      logger.info("<<< save encoding to " + tract.outputFile2);
      fs.mkdirSync(path.dirname(tract.outputFile1), { recursive: true });
      fs.writeFileSync(tract.outputFile2, JSON.stringify(encoding2, null, "  "), "utf8");
    }

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
    process.exitCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

};
