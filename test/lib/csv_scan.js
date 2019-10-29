/**
 * test/scan
 */
"use strict";

const scan = require('./_scan');
const logger = require('../../lib/logger');

logger.info("=== tests: CSV scan");

async function tests() {
  logger.info("=== scan local filesystem");
  await scan({
    source: {
      smt: "csv|./test/data/|*.csv|*",
      options: {
      }
    },
    scan: {
      recursive: false,
      forEach: (name) => {
        logger.info(name);
      }
    }
  });

  logger.info("=== scan S3 bucket");
  await scan({
    source: {
      smt: "csv|S3:dictadata.org|*.csv|*",
      options: {
      }
    },
    scan: {
      recursive: true,
      forEach: (name) => {
        logger.info(name);
      }
    }
  });

  logger.info("=== scan S3 bucket");
  await scan({
    source: {
      smt: "csv|S3:dictadata.org|*.csv|*",
      options: {
      }
    },
    scan: {
      recursive: false,
      forEach: (name) => {
        logger.info(name);
      }
    }
  });

}

tests();
