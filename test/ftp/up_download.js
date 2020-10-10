/**
 * test/ftp/up_download
 */
"use strict";

const download = require('../lib/_download');
const upload = require('../lib/_upload');
const logger = require('../../lib/logger');

logger.info("=== tests: ftp downloads");

async function test_1() {
  logger.info("=== download files from ftp folder");

  await download({
    origin: {
      smt: "*|ftp://localhost/test/data/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/output/downloads/|*|*"
    }
  });
}

async function test_2() {
  logger.info("=== upload files to ftp folder");

  await upload({
    origin: {
      smt: "*|./test/data/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "csv|ftp://localhost/test/data/uploads/|*|*",
    }
  });
}

async function test_3() {
  logger.info("=== download shape files");

  logger.verbose("--- create ftp");
  await download({
    origin: {
      smt: "*|ftp://ec2-3-208-205-6.compute-1.amazonaws.com/shapefiles/|*.*|*",
      options: {
        recursive: true,
        saveFiles: true,
        savePaths: true
      }
    },
    terminal: {
      smt: "*|./test/output/shapefiles/|*|*"
    }
  });
}

(async () => {
  await test_1();
  await test_2();
})();
