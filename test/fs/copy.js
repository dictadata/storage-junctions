/**
 * test/fs/copy
 */
"use strict";

const getFiles = require('../_lib/_getFiles');
const putFiles = require('../_lib/_putFiles');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: fs file copy");

async function test_1() {
  logger.info("=== download files");

  if (await getFiles({
    origin: {
      smt: "*|file:./test/_data/input/|foo*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/_data/output/fs/downloads/|*|*",
      options: {
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== upload files");

  if (await putFiles({
    origin: {
      smt: "*|./test/_data/input/|*.json|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      smt: "*|file:./test/_data/output/fs/uploads/|*|*",
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
