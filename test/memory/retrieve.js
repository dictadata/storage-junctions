/**
 * test/memory
 */
"use strict";

const retrieve = require('../_lib/_retrieve');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: memory");

async function tests() {

  logger.info("=== memory retrieve");
  if (await retrieve({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./test/_data/output/memory/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== memory retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "memory|testgroup|foo_schema_01|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 5
      }
    },
    terminal: {
      output: "./test/_data/output/memory/retrieve_2.json"
    }
  })) return 1;

  logger.info("=== memory retrieve w/ pattern");
  if (await retrieve({
    origin: {
      smt: "memory|testgroup|foo_widgets|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        count: 3,
        order: { "Dt Test": "asc" },
        fields: [ "Foo", "Baz", "tags", "widgets" ]
      }
    },
    terminal: {
      output: "./test/_data/output/memory/retrieve_3.json"
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await tests()) return;
};
