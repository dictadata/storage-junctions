/**
 * test/zip/list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: zip list");

async function test() {

  logger.info("=== list zip directory - forEach");
  if (await list({
    origin: {
      smt: "json|zip:./data/test/foofile.zip|*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./data/output/zip/list_1.json"
    }
  })) return 1;

  logger.info("=== list zip directory - recursive");
  if (await list({
    origin: {
      smt: "json|zip:./data/test/foofile.zip|*.json|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      output: "./data/output/zip/list_2.json"
    }
  })) return 1;

}

(async () => {
  if (await test()) return;
})();
