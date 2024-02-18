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
      smt: "*|file:./test/data/input/|foofile*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./test/data/output/fs/list_1.json"
    }
  })) return 1;

  logger.info("=== list fs directory (recursive)");
  if (await list({
    origin: {
      smt: {
        model: "*",
        locus: "./test/data/input/engrams/",
        schema: "*.json",
        key: "*"
      },
      options: {
        schema: "*.engram.json",
        recursive: true
      }
    },
    terminal: {
      output: "./test/data/output/fs/list_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
