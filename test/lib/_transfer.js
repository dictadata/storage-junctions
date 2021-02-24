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
    if (!tract.origin.options) tract.origin.options = {};
    if (!tract.terminal.options) tract.terminal.options = {};
    const transforms = tract.transforms || {};

    if (tract.origin.options && typeof tract.origin.options.encoding === "string") {
      // read encoding from file
      let filename = tract.origin.options.encoding;
      tract.origin.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }

    logger.info(">>> origin junction");
    jo = await storage.activate(tract.origin.smt, tract.origin.options);

    logger.debug(">>> get origin encoding");
    let encoding = await jo.getEncoding();  // load encoding from origin for validation

    if (tract.terminal.options && typeof tract.terminal.options.encoding === "string") {
      // read encoding from file
      let filename = tract.terminal.options.encoding;
      tract.terminal.options.encoding = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    else if (Object.keys(transforms).length > 0) {
      // otherwise run some objects through any transforms to get terminal encoding
      logger.verbose(">>> codify pipeline");
      let pipes = [];
      pipes.push(jo.createReadStream({ max_read: 100 }));

      for (let [tfType, tfOptions] of Object.entries(transforms))
        pipes.push(jo.createTransform(tfType, tfOptions));
      
      let codify = jo.createTransform('codify');
      pipes.push(codify);

      await stream.pipeline(pipes);
      tract.terminal.options.encoding = codify.encoding;
    }
    else
      tract.terminal.options.encoding = encoding;

    logger.debug(">>> encoding results");
    logger.debug(JSON.stringify(tract.terminal.options.encoding.fields, null, " "));

    logger.debug("create the terminal");
    jt = await storage.activate(tract.terminal.smt, tract.terminal.options);
    let result = await jt.createSchema();
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

    logger.verbose(">>> start transfer");
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
