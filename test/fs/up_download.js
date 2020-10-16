/**
 * test/fs/up_download
 */
"use strict";

const download = require('../lib/_download');
const upload = require('../lib/_upload');
const logger = require('../../lib/logger');

logger.info("=== tests: fs file copy");

async function test_1() {
  logger.info("=== download files");

  await download({
    origin: {
      smt: "*|./test/data/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      options: {
        downloads: "./test/output/downloads/"
      }
    }
  });
}

async function test_2() {
  logger.info("=== upload files");

  await upload({
    origin: {
      options: {
        uploads: "./test/data/*.json",
        recursive: true
      }
    },
    terminal: {
      smt: "*|./test/output/uploads/|*|*",
      options: {
        useRPath: true
      }
    }
  });
}

(async () => {
  await test_1();
  await test_2();
})();
