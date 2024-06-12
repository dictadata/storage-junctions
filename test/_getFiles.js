/**
 * test/lib/_getFiles
 *
 * Download file(s) from filesystem directly to a local folder.
 * Reads directory of remote file system before download(s).
 * getFiles is a filesystem method.
 */
"use strict";

const _pev = require('@dictadata/lib/test');
const _auth = require('./_auth');
const { Storage } = require('../storage');
const { logger } = require('@dictadata/lib');


module.exports = exports = async function (tract) {
  let retCode = 0;

  var junction;
  try {
    logger.info("=== download");

    logger.verbose("smt:" + JSON.stringify(tract.origin.smt, null, 2));
    if (tract.origin.options)
      logger.verbose("options:" + JSON.stringify(tract.origin.options));
    else
      tract.origin.options = {};

    logger.info(">>> activate junction");
    junction = await Storage.activate(tract.origin.smt, tract.origin.options);

    logger.verbose(">>> get list of desired files");
    let list;
    if (junction.smt.schema.includes('*') || junction.smt.schema.includes('?'))
      // wildcard
      ({ data: list } = await junction.list());
    else
      // single file
      list = [ { name: junction.smt.schema, rpath: junction.smt.schema } ];

    logger.verbose(">>> download files");
    // download is a filesystem level method
    let stfs = await junction.getFileSystem();

    for (let entry of list) {
      logger.info(entry.name);
      logger.verbose(JSON.stringify(entry, null, 2));

      let options = Object.assign({ smt: tract.terminal.smt, entry: entry }, tract.terminal.options);
      let ok = await stfs.getFile(options);
      if (!ok) {
        logger.error("download failed: " + entry.href);
        retCode = 1;
      }
    }

    logger.info("=== completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.message);
    retCode = 1;
  }
  finally {
    await junction.relax();
  }

  return process.exitCode = retCode;
};
