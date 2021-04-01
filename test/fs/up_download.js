/**
 * test/fs/up_download
 */
"use strict";

const download = require('../lib/_download');
const upload = require('../lib/_upload');
const { logger } = require('../../storage/utils');

logger.info("=== tests: fs file copy");

async function test_1() {
  logger.info("=== download files");

  if (await download({
    origin: {
      smt: "*|./data/test/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      options: {
        downloads: "./data/output/fs/downloads/"
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== upload files");

  if (await upload({
    origin: {
      options: {
        uploads: "./data/test/*.json",
        recursive: true
      }
    },
    terminal: {
      smt: "*|./data/output/fs/uploads/|*|*",
      options: {
        useRPath: true
      }
    }
  })) return 1;
}

(async () => {
  if (await test_1()) return;
  if (await test_2()) return;
})();
