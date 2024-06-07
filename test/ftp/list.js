/**
 * test/ftp_list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('@dictadata/storage-lib');

logger.info("=== tests: FTP list");

async function test_1() {

  logger.info("=== list ftp directory (forEach)");
  if (await list({
    origin: {
      smt: "json|ftp://dev.dictadata.net/dictadata/test/data/input/|foofile*.json|*",
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
        locus: "ftp://dev.dictadata.net/dictadata/test/data/input/engrams/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "foo?schema*.engram.json",
        recursive: true
      }
    },
    terminal: {
      output: "./test/data/output/ftp/list_2.json"
    }
  })) return 1;

  // "ftp://anonymous:anonymous@ftp2.census.gov/geo/tiger/TIGER2023PL/LAYER/VTD/2020/|tl_2023_??_vtd20.zip"
  // "ftp://dev.dictadata.net/dictadata/US/census.gov/geo/tiger/TIGER2023/COUNTY/|*.zip"
  logger.info("=== list tiger2023");
  if (await list({
    origin: {
      smt: "*|ftp://dev.dictadata.net/dictadata/US/census.gov/geo/tiger/TIGER2023/COUNTY/|*.zip|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      output: "./test/data/output/ftp/list_tiger2023.json"
    }
  })) return 1;

}

(async () => {
  if (await test_1()) return;
})();
