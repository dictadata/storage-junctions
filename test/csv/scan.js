/**
 * test/scan
 */
"use strict";

const scan = require('../lib/_scan');
const logger = require('../../lib/logger');

logger.info("=== tests: CSV scan");

async function tests() {

  logger.info("=== scan local filesystem");
  await scan({
    source: {
      smt: "csv|./test/|*.csv|*"
    },
    scan: {
      recursive: true,
      forEach: (name) => {
        logger.info("- " + name);
      }
    }
  });

  logger.info("=== scan S3 bucket (recursive)");
  await scan({
    source: {
      smt: "csv|S3:dictadata.org/test/output/|*.csv|*"
    },
    scan: {
      recursive: false
    }
  });

  logger.info("=== scan S3 bucket");
  await scan({
    source: {
      smt: {
        model: "csv",
        locus: "S3:dictadata.org/test/",
        schema: "*.csv.*",
        key: "*",
        aws_profile: ""
      },
      options: {}
    },
    scan: {
      recursive: true
    }
  });

}

async function main() {
  await tests();
}

main();
