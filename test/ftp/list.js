/**
 * test/ftp_list
 */
"use strict";

const list = require('../_lib/_list');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: FTP list");

async function test_1() {
  let retCode = 0;

  logger.info("=== list ftp directory (forEach)");
  retCode = await list({
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
      output: "./test/_data/output/ftp/list_1.json"
    }
  })
  if (retCode) return retCode;

  logger.info("=== list ftp directory (recursive)");
  retCode = await list({
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
      output: "./test/_data/output/ftp/list_2.json"
    }
  })
  if (retCode) return retCode;

  // "ftp://anonymous:anonymous@ftp2.census.gov/geo/tiger/TIGER2023PL/LAYER/VTD/2020/|tl_2023_??_vtd20.zip"
  // "ftp://dev.dictadata.net/dictadata/US/census.gov/geo/tiger/TIGER2023/COUNTY/|*.zip"
  logger.info("=== list tiger2023");
  retCode = await list({
    origin: {
      smt: "*|ftp://dev.dictadata.net/dictadata/US/census.gov/geo/tiger/TIGER2023/COUNTY/|*.zip|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      output: "./test/_data/output/ftp/list_tiger2023.json"
    }
  })
  if (retCode) return retCode;

  return retCode;
}

(async () => {
  let retCode = await test_1();
  return retCode;
})();
