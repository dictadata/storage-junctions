/**
 * test/getEncoding
 */
"use strict";

const _pev = require("./_process_events");
const storage = require("../../storage");
const { typeOf } = require("../../storage/utils");
const logger = require('../../storage/logger');
const fs = require('fs');
const path = require('path');

module.exports = exports = async function (tract) {
  logger.info(">>> create junction");
  if (!tract.terminal) tract.terminal = {};

  var jo;
  try {
    jo = await storage.activate(tract.origin.smt, tract.origin.options);
    let results = await jo.getEncoding();
    let encoding = results.data["encoding"];

    if (typeOf(encoding) === 'object') {
      logger.debug(JSON.stringify(encoding));
      if (tract.terminal && tract.terminal.output) {
        logger.verbose("<<< " + tract.terminal.output);
        fs.mkdirSync(path.dirname(tract.terminal.output), { recursive: true });
        fs.writeFileSync(tract.terminal.output, JSON.stringify(encoding, null, "  "));

        let expected_output = tract.terminal.output.replace("output", "expected");
        if (_compare(tract.terminal.output, expected_output))
          throw new storage.StorageError(409, "file compare failed");
      }
    }
    else
      logger.warn("storage schema was: " + encoding);

    logger.info(">>> completed");
  }
  catch (err) {
    logger.error('!!! request failed: ' + err.resultCode + " " + err.message);
    process.exitCode = 1;
  }
  finally {
    if (jo) await jo.relax();
  }

};
