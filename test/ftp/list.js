/**
 * test/ftp_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: FTP list");

async function test_1() {

  logger.info("=== list ftp directory (forEach)");
  await list({
    origin: {
      smt: "json|ftp://dicta:data@localhost/test/data/|*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./test/output/ftp_list_1.json"
    }
  });

  logger.info("=== list ftp directory (recursive)");
  await list({
    origin: {
      smt: {
        model: "json",
        locus: "ftp://dicta:data@localhost/test/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "foofile_*.json",
        recursive: true
      }
    },
    terminal: {
      output: "./test/output/ftp_list_2.json"
    }
  });

}

(async () => {
  await test_1();
})();
