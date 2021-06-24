/**
 * test/zip/copy
 */
"use strict";

const getFile = require('../lib/_getFile');
const { logger } = require('../../storage/utils');

logger.info("=== tests: zip downloads");

async function test_1() {
  logger.info("=== extract from zip file");

  if (await getFile({
    origin: {
      smt: "*|zip:./test/data/input/foofile.zip|*.json|*",
      options: {     
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/data/output/zip/downloads/|*|*",
      options: {
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== download shape files");

  if (await getFile({
    origin: {
      smt: "*|zip:./test/data/input/foofile.zip|subfolder/*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      smt: "*|./test/data/output/zip/downloads/|*|*",
      options: {
        keep_rpath: true
      }
    }
  })) return 1;
}

(async () => {
  if (await test_1()) return;
  if (await test_2()) return;
})();
