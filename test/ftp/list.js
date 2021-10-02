/**
 * test/ftp_list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: FTP list");

async function test_1() {

  logger.info("=== list ftp directory (forEach)");
  if (await list({
    origin: {
      smt: "json|ftp://dicta:data@localhost/data/dictadata.org/test/input/|foofile*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./test/data/output/ftp/list_1.json"
    }
  })) return 1;

  logger.info("=== list ftp directory (recursive)");
  if (await list({
    origin: {
      smt: {
        model: "json",
        locus: "ftp://dicta:data@localhost/data/dictadata.org/test/input/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "*.encoding.json",
        recursive: true
      }
    },
    terminal: {
      output: "./test/data/output/ftp/list_2.json"
    }
  })) return 1;

  logger.info("=== list census.gov");
  if (await list({
    origin: {
      smt: "json|ftp://anonymous:anonymous@ftp2.census.gov/geo/tiger/TIGER2020/COUNTY/|*.zip|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      output: "./test/data/output/ftp/list_census.json"
    }
  })) return 1;

}

(async () => {
  if (await test_1()) return;
})();
