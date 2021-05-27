/**
 * test/ftp_list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: FTP list");

async function test_1() {
/*
  logger.info("=== list ftp directory (forEach)");
  if (await list({
    origin: {
      smt: "json|ftp://dicta:data@localhost/data/test/|*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./data/output/ftp/list_1.json"
    }
  })) return 1;

  logger.info("=== list ftp directory (recursive)");
  if (await list({
    origin: {
      smt: {
        model: "json",
        locus: "ftp://dicta:data@localhost/data/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "foofile_*.json",
        recursive: true
      }
    },
    terminal: {
      output: "./data/output/ftp/list_2.json"
    }
  })) return 1;
*/

  logger.info("=== list census");
  if (await list({
    origin: {
      smt: "json|ftp://anonymous:anonymous@ftp2.census.gov/geo/tiger/TIGER2020/COUNTY/|*.zip|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      output: "./data/output/ftp/list_census.json"
    }
  })) return 1;
    
}

(async () => {
  if (await test_1()) return;
})();
