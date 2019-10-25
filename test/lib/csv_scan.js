/**
 * test/scan
 */
"use strict";

const scan = require('./_scan');
const logger = require('../../lib/logger');

logger.info("=== tests: CSV scan");

async function tests() {
  await scan({
    source: {
      smt: "csv|./test/data/|*.csv|*",
      options: {
      }
    },
    scan: {
      recursive: false,
      callback: (name) => {
        logger.info(name);
      }
    }
  });
}

tests();
