/**
 * test/fs/copy
 */
"use strict";

const getFile = require('../lib/_getFile');
const putFile = require('../lib/_putFile');
const { logger } = require('../../storage/utils');

logger.info("=== tests: fs file copy");

async function test_1() {
  logger.info("=== download files");

  if (await getFile({
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

  if (await putFile({
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
