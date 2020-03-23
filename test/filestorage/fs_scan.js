/**
 * test/scan
 */
"use strict";

const scan = require('../lib/_scan');
const logger = require('../../lib/logger');

logger.info("=== tests: local fs scans");

async function tests() {

  logger.info("=== scan local filesystem (forEach)");
  await scan({
    source: {
      smt: "csv|./test/output/|*.csv|*",
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

  logger.info("=== scan local filesystem (recursive)");
  await scan({
    source: {
      smt: {
        model: "json",
        locus: "./test/",
        schema: "*.json",
        key: "*"
      },
      options: {
        scan: {
          recursive: true
        }
      }
    }
  });

}

tests();
