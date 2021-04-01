/**
 * test/fs/list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: fs list");

async function tests() {

  logger.info("=== list fs directory (forEach)");
  if (await list({
    origin: {
      smt: "json|./data/test/|*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./data/output/fs/list_1.json"
    }
  })) return 1;

  logger.info("=== list fs directory (recursive)");
  if (await list({
    origin: {
      smt: {
        model: "json",
        locus: "./data/test/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "foofile_*.json",
        recursive: true
      }
    },
    terminal: {
      output: "./data/output/fs/list_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
