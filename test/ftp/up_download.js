/**
 * test/ftp/up_download
 */
"use strict";

const download = require('../lib/_download');
const upload = require('../lib/_upload');
const { logger } = require('../../storage/utils');

logger.info("=== tests: ftp downloads");

async function test_1() {
  logger.info("=== download files from ftp folder");

  if (await download({
    origin: {
      smt: "*|ftp://dicta:data@localhost/data/test/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      options: {
        downloads: "./data/output/ftp/downloads/"
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== upload files to ftp folder");

  if (await upload({
    origin: {
      options: {
        uploads: "./data/test/*.csv",
        recursive: false
      }
    },
    terminal: {
      smt: "*|ftp://dicta:data@localhost/data/output/uploads/|*|*",
      options: {}
    }
  })) return 1;
}

async function test_3() {
  logger.info("=== download shape files");
// smt: "*|ftp://dicta:data@localhost/shapefiles/|*.*|*",

  if (await download({
    origin: {
      smt: "json|ftp://anonymous:anonymous@ftp2.census.gov/geo/tiger/TIGER2020/COUNTY/|*.zip|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      options: {
        downloads: "./data/output/ftp/shapefiles/",
        useRPath: true
      }
    }
  })) return 1;
}

(async () => {
  //if (await test_1()) return;
  //if (await test_2()) return;
  if (await test_3()) return;
})();
