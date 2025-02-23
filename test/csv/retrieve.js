/**
 * test/csv/retrieve.js
 */
"use strict";

const retrieve = require('../_lib/_retrieve');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: csv retrieve");

async function tests() {

  logger.info("=== csv retrieve");
  if (await retrieve({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv|*",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema.engram.json",
        hasHeader: true
      }
    },
    terminal: {
      output: "./test/_data/output/csv/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== csv retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv|*",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema.engram.json",
        hasHeader: true
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
      output: "./test/_data/output/csv/retrieve_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
