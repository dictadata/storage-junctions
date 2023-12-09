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
      smt: "json|zip:./data/input/foofile.zip|*.json|*",
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
      smt: "json|zip:./data/input/foofile.zip|*.json|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      output: "./data/output/zip/list_2.json"
    }
  })) return 1;

  logger.info("=== list zip files - recursive");
  if (await list({
    origin: {
      smt: "*|zip:/var/data/US/IA/sos.iowa.gov/shapefiles/City Precincts/Ames.zip|*|*",
      options: {
        recursive: true
      }
    },
    terminal: {
      output: "./data/output/zip/list_AmesZip.json"
    }
  })) return 1;

  logger.info("=== list zip by prefix ");
  if (await list({
    origin: {
      smt: "*|zip:/var/data/US/IA/sos.iowa.gov/shapefiles/City Precincts/Ames.zip/Ames/|*|*",
      options: {
        recursive: false
      }
    },
    terminal: {
      output: "./data/output/zip/list_AmesPrefix.json"
    }
  })) return 1;

}

(async () => {
  if (await test()) return;
})();
