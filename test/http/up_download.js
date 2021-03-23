/**
 * test/http/download
 */
"use strict";

const download = require('../lib/_download');
const logger = require('../../storage/logger');

logger.info("=== tests: http downloads");

async function test_1() {
  logger.info("=== download from HTML directory page");

  await download({
    origin: {
      smt: "*|http://localhost/test/data/|*.csv|*",
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
  logger.info("=== download shape files");

  await download({
    origin: {
      smt: "shp|http://ec2-3-208-205-6.compute-1.amazonaws.com/shapefiles/|*.*|*",
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
})();
