/**
 * test/ftp/copy
 */
"use strict";

const getFiles = require('../lib/_getFiles');
const putFiles = require('../lib/_putFiles');
const { logger } = require('../../storage/utils');

logger.info("=== tests: ftp downloads");

async function test_1() {
  logger.info("=== download files from ftp folder");

  if (await getFiles({
    origin: {
      smt: "*|ftp://dicta:data@localhost/data/dictadata.org/test/input/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/data/output/ftp/downloads/|*|*",
      options: {
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== upload files to ftp folder");

  if (await putFiles({
    origin: {
      smt: "*|./test/data/input/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|ftp://dicta:data@localhost/data/dictadata.org/test/output/uploads/|*|*",
      options: {}
    }
  })) return 1;
}

async function test_3() {
  logger.info("=== download shape files");
  // smt: "json|ftp://anonymous:anonymous@ftp2.census.gov/geo/tiger/TIGER2020/STATE/|*.zip|*",

  if (await getFiles({
    origin: {
      smt: "*|ftp://dicta:data@localhost/data/sos.iowa.gov/shapefiles/City Precincts/|Iowa*.zip|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/data/output/ftp/shapefiles/|*|*",
      options: {
        keep_rpath: true
      }
    }
  })) return 1;
}

(async () => {
  if (await test_1()) return;
  if (await test_2()) return;
  if (await test_3()) return;
})();
