/**
 * test/lib/_putFile
 *
 * Upload file(s) from local folder directly to a filesystem.
 * putFile is a filesystem method.
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const Storage = require("../../storage");
const { logger } = require('../../storage/utils');
const path = require('path');

module.exports = exports = async function (tract) {
  let retCode = 0;

  var local;
  var junction;
  try {
    logger.info(">>> create generic junction for local files");
    let smt = tract.origin.smt;
    logger.verbose("smt:" + JSON.stringify(smt, null, 2));
    local = await Storage.activate(smt, tract.origin.options);

    logger.info(">>> get list of local files");
    let { data: list } = await local.list();

    logger.info(">>> create junction");
    logger.verbose("smt:" + JSON.stringify(tract.terminal.smt, null, 2));
    if (tract.terminal.options)
      logger.verbose("options:" + JSON.stringify(tract.terminal.options));
    junction = await Storage.activate(tract.terminal.smt, tract.terminal.options);

    logger.info(">>> upload files");
    let stfs = await junction.getFileSystem();

    for (let entry of list) {
      //logger.debug(JSON.stringify(entry, null, 2));

      let options = Object.assign({
        smt: tract.origin.smt,
        entry: entry
      },
        tract.origin.options);

      let results = await stfs.putFile(options);
      if (results.status !== 0) {
        logger.error("!!! putFile failed: " + results.status);
        retCode = 1;
        break;
      }
    }
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.status + " " + err.message);
    retCode = 1;
  }
  finally {
    await local.relax();
    await junction.relax();
  }

  return process.exitCode = retCode;
};
