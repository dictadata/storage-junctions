/**
 * test/lib/upload
 * 
 * upload file(s) from local folder directly to a filesystem.
 */
"use strict";

const storage = require("../../lib/index");
const logger = require('../../lib/logger');


module.exports = exports = async function (tract) {

  var junction;
  try {
    logger.info(">>> create junction");
    logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
    if (tract.origin.options)
      logger.verbose("options:" + JSON.stringify(tract.origin.options));
    junction = await storage.activate(tract.origin.smt, tract.origin.options);

    logger.info("=== get list of desired files");
    let list = await junction.list();

    logger.info("=== download files");
    // download is a filesystem level method
    let stfs = await junction.getFileSystem();

    for (let entry of list) {
      logger.verbose(JSON.stringify(entry, null, 2));

      let options = Object.assign(entry, {
        saveFiles: true,
        saveFolder: tract.terminal.output || './'
      });
      let ok = await stfs.download(options);
      if (!ok)
        logger.error("download failed: " + entry.href);
    }
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
  }
  finally {
    await junction.relax();
  }

};
