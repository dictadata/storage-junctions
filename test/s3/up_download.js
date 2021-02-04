/**
 * test/S3/up_download
 */
"use strict";

const download = require('../lib/_download');
const upload = require('../lib/_upload');
const logger = require('../../lib/logger');

logger.info("=== tests: S3 uploads/downloads");

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
        downloads: "./output/downloads/"
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
      smt: "*|S3:dictadata.org/output/uploads/|*|*",
      options: {}
    }
  });
}

async function test_3() {
  logger.info("=== upload shape files");

  await upload({
    origin: {
      options: {
        uploads: "C:\\projectdata\\shapefiles\\United States\\Iowa\\*.*",
        recursive: true
      }
    },
    terminal: {
      smt: "*|S3:dictadata.org/shapefiles/United States/Iowa/|*|*",
      options: {
        useRPath: true
      }
    }
  });
}

async function test_4() {
  logger.info("=== download shape files");

  await download({
    origin: {
      smt: "*|S3:dictadata.org/shapefiles/|*.*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      options: {
        downloads: "./output/shapefiles/",
        useRPath: true
      }
    }
  });
}

(async () => {
  await test_1();
  await test_2();
  await test_3();
  await test_4();
})();
