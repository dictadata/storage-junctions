/**
 * test/ftp_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: FTP list");

async function tests() {

  logger.info("=== list ftp bucket (forEach)");
  await list({
    source: {
      smt: "csv|ftp:/test/output/|*.csv|*",
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

  logger.info("=== list ftp bucket (recursive)");
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
