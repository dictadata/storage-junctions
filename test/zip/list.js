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
      smt: "json|zip:./test/data/input/foofile.zip|*.json|*",
      options: {
        recursive: false,
        forEach: (entry) => {
          logger.info("- " + entry.name);
        }
      }
    },
    terminal: {
      output: "./test/data/output/zip/list_1.json"
    }
  })) return 1;

  logger.info("=== list zip directory - recursive");
  if (await list({
    origin: {
      smt: "json|zip:./test/data/input/foofile.zip|*.json|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      output: "./test/data/output/zip/list_2.json"
    }
  })) return 1;

  logger.info("=== list zip directory - recursive");
  if (await list({
    origin: {
      smt: "*|zip:/var/data/US/IA/sos.iowa.gov/shapefiles/City Precincts/Dubuque.zip/Dubuque/|*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      output: "./test/data/output/zip/list_dubuque.json"
    }
  })) return 1;

}

(async () => {
  if (await test()) return;
})();
