/**
 * test/zip/copy
 */
"use strict";

const getFiles = require('../_lib/_getFiles');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: zip downloads");

async function test_1() {
  logger.info("=== extract from zip file");

  if (await getFiles({
    origin: {
      smt: "*|zip:./test/_data/input/foofile.zip|foo*.json|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/_data/output/zip/downloads/|*|*",
      options: {
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== download shape files");

  if (await getFiles({
    origin: {
      smt: "*|zip:./test/_data/input/foofile.zip|subfolder/*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      smt: "*|./test/_data/output/zip/downloads/|*|*",
      options: {
        use_rpath: true
      }
    }
  })) return 1;
}

(async () => {
  if (await test_1()) return;
  if (await test_2()) return;
})();
