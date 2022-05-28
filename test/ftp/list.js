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
      smt: "json|ftp://dicta:data@127.0.0.1/data/dictadata.org/test/input/|foofile*.json|*",
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
        locus: "ftp://dicta:data@127.0.0.1/data/dictadata.org/test/input/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "*.encoding.json",
        recursive: true
      }
    },
    terminal: {
      output: "./data/output/ftp/list_2.json"
    }
  })) return 1;

  logger.info("=== list tiger2020");
  if (await list({
    origin: {
      smt: "json|ftp://dicta:data@127.0.0.1/data/US/census.gov/geo/tiger/TIGER2020/COUNTY/|*.zip|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      output: "./data/output/ftp/list_tiger2020.json"
    }
  })) return 1;

}

(async () => {
  if (await test_1()) return;
})();
