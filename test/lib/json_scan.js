/**
 * test/scan
 */
"use strict";

const scan = require('./_scan');
const logger = require('../../lib/logger');

logger.info("=== tests: json scan");

async function tests() {
  await scan({
    source: {
      smt: "json|./test/data/|test*.json|*",
      options: {
      }
    },
    scan: {
      recursive: true,
      callback: (name) => {
        logger.info(name);
      }
    }
  });

  await scan({
    source: {
      smt: "json|S3:icbrewlab.com|*.json|*",
      options: {
      }
    },
    scan: {
      recursive: true,
      callback: (name) => {
        logger.info(name);
      }
    }
  });

}

tests();
