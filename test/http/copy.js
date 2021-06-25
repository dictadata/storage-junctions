/**
 * test/http/copy
 */
"use strict";

const getFile = require('../lib/_getFile');
const { logger } = require('../../storage/utils');

logger.info("=== tests: http downloads");

async function test_1() {
  logger.info("=== download from HTML directory page");

  if (await getFile({
    origin: {
      smt: "*|http://localhost/data/test/|*.csv|*",
      options: {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.5',
          'accept-encoding': 'gzip, deflate',
          'cache-control': 'max-age=0'
        },        
        recursive: false
      }
    },
    terminal: {
      smt: "*|./test/data/output/http/downloads/|*|*",
      options: {
      }
    }
  })) return 1;
}

async function test_2() {
  logger.info("=== download shape files");

  if (await getFile({
    origin: {
      smt: "shp|http://ec2-3-208-205-6.compute-1.amazonaws.com/data/sos.iowa.gov/shapefiles/City Precincts/|Iowa*.*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      smt: "*|./test/data/output/http/shapefiles/|*|*",
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
