/**
 * test/scan
 */
"use strict";

const scan = require('./_scan');
const logger = require('../../lib/logger');

logger.info("=== tests: json scan");

async function tests() {
  logger.info("=== scan local filesystem");
  await scan({
    source: {
      smt: "json|./test/data/|test*.json|*"
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
      smt: "json|S3:dictadata.org/test/|*.json|*"
    },
    scan: {
      recursive: false,
      forEach: (name) => {
        logger.info(name);
      }
    }
  });

  logger.info("=== scan S3 bucket (recursive)");
  await scan({
    source: {
      smt: "json|S3:dictadata.org/test/|*.json|*"
    },
    scan: {
      recursive: true,
      forEach: (name) => {
        logger.info(name);
      }
    }
  });

}

tests();
