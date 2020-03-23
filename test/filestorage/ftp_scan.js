/**
 * test/scan
 */
"use strict";

const scan = require('../lib/_scan');
const logger = require('../../lib/logger');

logger.info("=== tests: FTP scans");

async function tests() {

  logger.info("=== scan ftp bucket (forEach)");
  await scan({
    source: {
      smt: "csv|ftp:/test/output/|*.csv|*",
      options: {
        ftp: {
          host: 'localhost',
          port: 21,
          user: 'dicta',
          password: 'data'
        },
        scan: {
          recursive: false,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    }
  });

  logger.info("=== scan ftp bucket (recursive)");
  await scan({
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
        scan: {
          recursive: true
        }
      }
    }
  });

}

async function main() {
  await tests();
}

main();
