/**
 * test/S3/up_download
 */
"use strict";

const download = require('../lib/_download');
const upload = require('../lib/_upload');
const logger = require('../../lib/logger');

logger.info("=== tests: S3 downloads");

async function test_1() {
  logger.info("=== download files from S3 folder");

  await download({
    origin: {
      smt: "*|S3:dictadata.org/test/data/|*.csv|*",
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
  logger.info("=== upload files to S3 folder");

  await upload({
    origin: {
      options: {
        uploads: "./test/data/*.csv",
        recursive: false
      }
    },
    terminal: {
      smt: "*|S3:dictadata.org/test/output/uploads/|*|*",
      options: {}
    }
  });
}

async function test_3() {
  logger.info("=== download shape files");

  logger.verbose("--- create S3");
  await download({
    origin: {
      smt: "*|S3:dictadata.org/shapefiles/|*.*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      options: {
        downloads: "./test/output/shapefiles/",
        useRPath: true
      }
    }
  });
}

(async () => {
  await test_1();
  await test_2();
  await test_3();
})();
