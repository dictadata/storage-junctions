/**
 * test/ftp/copy
 */
"use strict";

const getFiles = require('../_lib/_getFiles');
const putFiles = require('../_lib/_putFiles');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: ftp downloads");

async function test_1() {
  logger.info("=== download files from ftp folder");

  if (await getFiles({
    origin: {
      smt: "*|ftp://dev.dictadata.net/dictadata/test/data/input/|foo*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/_data/output/ftp/downloads/|*|*",
      options: {
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== upload files to ftp folder");

  if (await putFiles({
    origin: {
      smt: "*|./test/_data/input/|*.csv|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|ftp://dev.dictadata.net/dictadata/test/data/output/uploads/|*|*",
      options: {}
    }
  })) return 1;
}

async function test_3() {
  logger.info("=== download shape files");

  if (await getFiles({
    origin: {
      smt: "*|ftp://dev.dictadata.net/dictadata/IA/sos.iowa.gov/shapefiles/City Precincts/|Iowa*.zip|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/_data/output/ftp/shapefiles/|*|*",
      options: {
        use_rpath: true
      }
    }
  })) return 1;
}

(async () => {
  if (await test_1()) return;
  if (await test_2()) return;
  if (await test_3()) return;
})();
