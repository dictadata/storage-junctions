/**
 * test/tee
 */
"use strict";

const storage = require("../../index");
const logger = require('../../lib/logger');

const fs = require('fs');
const stream = require('stream');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);
const finished = util.promisify(stream.finished);

/**
 * transfer fucntion
 */
module.exports = exports = async function (tract) {

  var js;
  var jdl = [];
  try {
    let reader = null;
    let writers = [];

    logger.info(">>> create origin junction");
    let origin_transforms = tract.transforms || {};
    js = await storage.activate(tract.origin.smt, tract.origin.options);

    logger.debug(">>> get origin encoding");
    let encoding = tract.origin.encoding;
    if (typeof encoding === "string")
      encoding = JSON.parse(fs.readFileSync(encoding, "utf8"));
    if (typeof encoding === "object")
      encoding = js.putEncoding(encoding);
    else
      encoding = await js.getEncoding();

    logger.info(">>> create origin pipeline");
    reader = js.getReadStream();
    for (let [tfType,tfOptions] of Object.entries(origin_transforms))
      reader = reader.pipe(js.getTransform(tfType, tfOptions));

    logger.info(">>> create terminus pipeline(s)");
    if (!Array.isArray(tract.terminus))
      throw new Error("tract.terminus not an Array");

    for (let branch of tract.terminus) {
      let transforms = branch.transforms || {};

      logger.info(">>> create terminus junction")
      let jd = await storage.activate(branch.terminus.smt, branch.terminus.options);
      jdl.push(jd);

      logger.info(">>> put terminus encoding")
      if (branch.terminus.encoding)
        encoding = branch.terminus.encoding;
      if (typeof encoding === "string")
        encoding = JSON.parse(fs.readFileSync(encoding, "utf8"));
      encoding = await jd.putEncoding(encoding);

      logger.info(">>> create terminus tee");
      let writer = null;
      // add transforms
      for (let [tfType,tfOptions] of Object.entries(transforms)) {
        let t = jd.getTransform(tfType, tfOptions);
        if (!writer)
          writer = reader.pipe(t);
        else
          writer = writer.pipe(t);
      }
      // add terminus
      let w = jd.getWriteStream();
      if (!writer)
        writer = reader.pipe(w);
      else
        writer = writer.pipe(w);

      writers.push(writer);
    }

    logger.info(">>> wait on pipes");
    await finished(reader);
    for (let writer of writers)
      await finished(writer);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    if (js)
      await js.relax();
    for (let j of jdl)
      await j.relax();
  }

};
