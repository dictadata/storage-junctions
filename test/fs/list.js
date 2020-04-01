/**
 * test/fs_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: fs list");

async function tests() {

  logger.info("=== list fs directory (forEach)");
  await list({
    source: {
      smt: "json|./test/data/|*.json|*",
      options: {
        list: {
          recursive: false,
          forEach: (name) => {
            logger.info("- " + name);
          }
        }
      }
    },
    outputFile: "./test/output/fs_list_1.json"
  });

  logger.info("=== list fs directory (recursive)");
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
          schema: "foofile_*.json",
          recursive: true
        }
      }
    },
    outputFile: "./test/output/fs_list_2.json"
  });

}

tests();
