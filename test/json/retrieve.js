/**
 * test/json/retrieve.js
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: json retrieve");

async function tests() {

  logger.info("=== json retrieve");
  if (await retrieve({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
      options: {
        encoding: "./test/data/input/foo_schema.encoding.json"
      }
    },
    terminal: {
      output: "./test/data/output/json/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== json retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
      options: {
        encoding: "./test/data/input/foo_schema.encoding.json",
      },
      pattern: {
        match: {
          "Bar": { "wc": "row*" },
          "Baz": [ 456, 789 ]
        },
        fields: [ "Foo", "Bar", "Baz", "Dt Test" ]
      }
    },
    terminal: {
      output: "./test/data/output/json/retrieve_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
