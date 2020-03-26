/**
 * test/fs_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: local fs list");

async function tests() {

  logger.info("=== list local filesystem (forEach)");
  await list({
    source: {
      smt: "csv|./test/output/|*.csv|*",
      options: {
        list: {
          recursive: false,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    }
  });

  logger.info("=== list local filesystem (recursive)");
  await list({
    source: {
      smt: {
        model: "json",
        locus: "./test/",
        schema: "*.json",
        key: "*"
      },
      options: {
        list: {
          recursive: true
        }
      }
    }
  });

}

tests();
