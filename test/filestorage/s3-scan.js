/**
 * test/scan
 */
"use strict";

const scan = require('../lib/_scan');
const logger = require('../../lib/logger');

logger.info("=== tests: S3 scans");

async function tests() {

  logger.info("=== scan S3 bucket (forEach)");
  await scan({
    source: {
      smt: "csv|S3:dictadata.org/test/output/|*.csv|*",
      options: {
        scan: {
          recursive: false,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    }
  });

  logger.info("=== scan S3 bucket (recursive)");
  await scan({
    source: {
      smt: {
        model: "json",
        locus: "S3:dictadata.org/test/",
        schema: "*.json",
        key: "*"
      },
      options: {
        s3: {
          aws_profile: ""
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
