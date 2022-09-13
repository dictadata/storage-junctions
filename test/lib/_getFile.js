/**
 * test/lib/_getFile
 *
 * Download file from filesystem directly to a local folder.
 * getFile is a filesystem method.
 */
"use strict";

const _pev = require("./_process_events");
const _init = require("./_init");
const Storage = require("../../storage");
const { logger } = require('../../storage/utils');

module.exports = exports = async function (tract) {
  let retCode = 0;

  logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
  if (tract.origin.options)
    logger.verbose("options:" + JSON.stringify(tract.origin.options));

  var junction;
  try {
    if (!tract.origin.options)
      tract.origin.options = {};

    logger.info(">>> create junction");
    junction = await Storage.activate(tract.origin.smt, tract.origin.options);
    let stfs = await junction.getFileSystem();

    let options = Object.assign({
      smt: tract.terminal.smt,
      entry: {
        name: junction.smt.schema,
        rpath: junction.smt.schema
      },
    },
      tract.terminal.options);

    let results = await stfs.getFile(options);
    if (results.resultCode !== 0) {
      logger.error("!!! getFile failed: " + entry.name);
      retCode = 1;
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
