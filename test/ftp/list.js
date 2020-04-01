/**
 * test/ftp_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: FTP list");

async function tests() {

  logger.info("=== list ftp directory (forEach)");
  await list({
    source: {
      smt: "json|ftp:/test/data/|*.json|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        },
        list: {
          recursive: false,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    },
    outputFile: "./test/output/ftp_list_1.json"
  });

  logger.info("=== list ftp directory (recursive)");
  await list({
    source: {
      smt: {
        model: "json",
        locus: "ftp:/test/",
        schema: "*.json",
        key: "*"
      },
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        },
        list: {
          schema: "foofile_*.json",
          recursive: true
        }
      }
    },
    outputFile: "./test/output/ftp_list_2.json"
  });

}

async function main() {
  await tests();
}

main();
