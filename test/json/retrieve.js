/**
 * test/json/retrieve.js
 */
"use strict";

const retrieve = require('../_lib/_retrieve');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: json retrieve");

async function tests() {

  logger.info("=== json retrieve");
  if (await retrieve({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema.engram.json"
      }
    },
    terminal: {
      output: "./test/_data/output/json/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== json retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "json|./test/_data/input/|foofile.json|*",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema.engram.json",
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
      output: "./test/_data/output/json/retrieve_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
