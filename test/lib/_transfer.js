/**
 * test/transfer
 */
"use strict";

const storage = require("../../lib/index");
const { typeOf } = require("../../lib/types");
const logger = require('../../lib/logger');

const fs = require('fs');
const stream = require('stream/promises');

/**
 * transfer function
 */
module.exports = exports = async function (tract) {

  var jo, jt;  // junctions origin, terminal
  try {
    logger.info(">>> create junctions");
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    const transforms = tract.transforms || {};

    logger.debug(">>> get origin encoding");
    // load encoding from origin for validation
    let encoding = tract.origin.encoding;
    if (typeof encoding === "string")
      encoding = JSON.parse(fs.readFileSync(encoding, "utf8"));
    if (typeOf(encoding) === "object")
      encoding = await jo.putEncoding(encoding, true);
    else
      encoding = await jo.getEncoding();

    let overlay = false;
    if (tract.terminal.encoding) {
      // use configured encoding
      overlay = true;
      encoding = tract.terminal.encoding;
      if (typeof encoding === "string")
        encoding = JSON.parse(fs.readFileSync(encoding, "utf8"));
    }
    else if (Object.keys(transforms).length > 0) {
      // run some objects through any transforms to get terminal encoding
      logger.verbose(">>> codify pipeline");
      let pipes = [];
      pipes.push(jo.createReadStream({ max_read: 100 }));

      for (let [tfType, tfOptions] of Object.entries(transforms))
        pipes.push(jo.createTransform(tfType, tfOptions));
      
      let ct = jo.createTransform('codify');
      pipes.push(ct);

      await stream.pipeline(pipes);
      encoding = await ct.getEncoding();
    }

    logger.debug(">>> encoding results");
    logger.debug(JSON.stringify(encoding.fields, null, " "));

    logger.debug("create the terminal");
    jt = await storage.activate(tract.terminal.smt, tract.terminal.options);

    logger.verbose(">>> put terminal encoding");
    let result = await jt.putEncoding(encoding, overlay);
    if (typeOf(result) !== "object")
      logger.info("could not create storage schema: " + result);

    
    // transfer the data
    logger.info(">>> transfer pipeline");
    let pipes = [];
    pipes.push(jo.createReadStream());

    for (let [tfType, tfOptions] of Object.entries(transforms))
      pipes.push(jo.createTransform(tfType, tfOptions));
    
    let tws = jt.createWriteStream({
      progress: (stats) => {
        console.log(stats.count);
      }
    });
    pipes.push(tws);

    await stream.pipeline(pipes);
    logger.info(">>> completed");
    let stats = tws.statistics;
    console.log(stats.count + ", " + stats.elapsed / 1000 + "s, " + Math.round(stats.count / (stats.elapsed / 1000)) + "/sec");
  }
  catch (err) {
    logger.error('!!! transfer failed: ' + err.message);
    process.exitCode = 1;
  }
  finally {
    if (jo) await jo.relax();
    if (jt) await jt.relax();
  }

};
