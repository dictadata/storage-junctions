/**
 * test/s3/download
 */
"use strict";

const download = require('../lib/_download');
const logger = require('../../lib/logger');

logger.info("=== tests: s3 downloads");

async function test_1() {
  logger.info("=== download from HTML directory page");

  logger.verbose("--- create s3");
  await download({
    origin: {
      smt: "*|s3://localhost/test/data/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      options: {
        folder: "./test/output/downloads/"
      }
    }
  });
}

async function test_2() {
  logger.info("=== download shape files");

  logger.verbose("--- create s3");
  await download({
    origin: {
      smt: "shp|s3://ec2-3-208-205-6.compute-1.amazonaws.com/shapefiles/|*.*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      options: {
        folder: "./test/output/shapefiles/",
        useRPath: true
      }
    }
  });
}

(async () => {
  await test_1();
  await test_2();
})();
