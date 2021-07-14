/**
 * test/fs/copy
 */
"use strict";

const getFiles = require('../lib/_getFiles');
const putFiles = require('../lib/_putFiles');
const { logger } = require('../../storage/utils');

logger.info("=== tests: fs file copy");

async function test_1() {
  logger.info("=== download files");

  if (await getFiles({
    origin: {
      smt: "*|file:./test/data/input/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/data/output/fs/downloads/|*|*",
      options: {
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== upload files");

  if (await putFiles({
    origin: {
      smt: "*|./test/data/input/|*.json|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      smt: "*|file:./test/data/output/fs/uploads/|*|*",
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
