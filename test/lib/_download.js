/**
 * test/lib/download
 * 
 * download file(s) from filesystem directly to a local folder.
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../storage");
const { logger } = require('../../storage/utils');


module.exports = exports = async function (tract) {
  let retCode = 0;

  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options)
    logger.verbose("options:" + JSON.stringify(tract.origin.options));

  var junction;
  try {
    logger.info(">>> create junction");
    junction = await storage.activate(tract.origin.smt, tract.origin.options);

    logger.info(">>> get list of desired files");
    let results = await junction.list();
    let { data: list } = results;

    logger.info(">>> download files");
    // download is a filesystem level method
    let stfs = await junction.getFileSystem();

    for (let entry of list) {
      logger.debug(JSON.stringify(entry, null, 2));

      let options = Object.assign({}, tract.terminal.options, entry);
      let results = await stfs.download(options);
      if (results.resultCode !== 0) {
        logger.error("!!! download failed: " + entry.name);
        retCode = 1;
        break;
      }
    }
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
    retCode = 1;
  }
  finally {
    await junction.relax();
  }

  return process.exitCode = retCode;
};
