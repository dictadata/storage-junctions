/**
 * test/zip/download
 */
"use strict";

const download = require('../lib/_download');
const { logger } = require('../../storage/utils');

logger.info("=== tests: zip downloads");

async function test_1() {
  logger.info("=== extract from zip file");

  if (await download({
    origin: {
      smt: "json|zip:./data/test/foofile.zip|*.json|*",
      options: {     
        recursive: false
      }
    },
    terminal: {
      options: {
        downloads: "./data/output/zip/downloads/"
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== download shape files");

  if (await download({
    origin: {
      smt: "json|zip:./data/test/foofile.zip|subfolder/*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      options: {
        downloads: "./data/output/zip/downloads/",
        useRPath: true
      }
    }
  })) return 1;
}

(async () => {
  if (await test_1()) return;
  if (await test_2()) return;
})();
