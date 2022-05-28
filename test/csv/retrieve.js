/**
 * test/csv/retrieve.js
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: csv retrieve");

async function tests() {

  logger.info("=== csv retrieve");
  if (await retrieve({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        encoding: "./data/input/foo_schema.encoding.json"
      }
    },
    terminal: {
      output: "./data/output/csv/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== csv retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        encoding: "./data/input/foo_schema.encoding.json",
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
      output: "./data/output/csv/retrieve_2.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
