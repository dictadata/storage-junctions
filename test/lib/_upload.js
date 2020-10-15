/**
 * test/lib/upload
 * 
 * upload file(s) from local folder directly to a filesystem.
 */
"use strict";

const storage = require("../../lib/index");
const logger = require('../../lib/logger');
const path = require('path');

module.exports = exports = async function (tract) {

  var generic;
  var junction;
  try {
    logger.info(">>> create generic for local files");
    let p = path.parse(tract.origin.options.filespec);
    let smt = "*|" + p.dir + "/|" + p.base + "|*";
    logger.verbose("smt:" + JSON.stringify(smt, null, 2));
    generic = await storage.activate(smt);

    logger.info("=== get list of local files");
    let list = await generic.list();

    logger.info(">>> create junction");
    logger.verbose("smt:" + JSON.stringify(tract.terminal.smt, null, 2));
    if (tract.terminal.options)
      logger.verbose("options:" + JSON.stringify(tract.terminal.options));
    junction = await storage.activate(tract.terminal.smt, tract.terminal.options);

    logger.info("=== upload files");
    // download is a filesystem level method
    let stfs = await junction.getFileSystem();

    for (let entry of list) {
      logger.debug(JSON.stringify(entry, null, 2));

      let options = Object.assign({ folder: p.dir + '/' }, tract.origin.options, entry);
      let ok = await stfs.upload(options);
      if (!ok)
        logger.error("download failed: " + entry.href);
    }
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await generic.relax();
    await junction.relax();
  }

};
