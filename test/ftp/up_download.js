/**
 * test/ftp/up_download
 */
"use strict";

const download = require('../lib/_download');
const upload = require('../lib/_upload');
const logger = require('../../storage/logger');

logger.info("=== tests: ftp downloads");

async function test_1() {
  logger.info("=== download files from ftp folder");

  await download({
    origin: {
      smt: "*|ftp://dicta:data@localhost/test/data/|*.csv|*",
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
  logger.info("=== upload files to ftp folder");

  await upload({
    origin: {
      options: {
        uploads: "./test/data/*.csv",
        recursive: false
      }
    },
    terminal: {
      smt: "*|ftp://dicta:data@localhost/test/output/uploads/|*|*",
      options: {}
    }
  });
}

async function test_3() {
  logger.info("=== download shape files");

  await download({
    origin: {
      smt: "*|ftp://dicta:data@localhost/shapefiles/|*.*|*",
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
})();
