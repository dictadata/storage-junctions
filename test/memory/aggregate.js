/**
 * test/memory
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const { logger } = require('@dictadata/storage-lib');

async function tests() {

  logger.info("=== memory aggregate");
  if (await retrieve({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo",
      pattern: {
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        aggregate: {
          "baz_sum": { "sum": "Baz" },
          "fobe_max": { "max": "Fobe" }
        }
      }
    },
    terminal: {
      output: './test/data/output/memory/aggregate_1.json'
    }
  })) return 1;

  logger.info("=== memory aggregate summary");
  if (await retrieve({
    origin: {
      smt: "memory|testgroup|foo_schema|*",
      pattern: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        },
        aggregate: {
          "sum": { "sum": "Baz" },
          "avg": { "avg": "Baz" },
          "min": { "min": "Baz" },
          "max": { "max": "Baz" },
          "count": { "count": "Baz" }
        },
        "order": { "sum": "desc" },
        "count": 10
      }
    },
    terminal: {
      output: './test/data/output/memory/aggregate_2.json'
    }
  })) return 1;

  logger.info("=== memory aggregate w/ groupby");
  if (await retrieve({
    origin: {
      smt: "memory|testgroup|foo_schema|*",
      pattern: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        },
        aggregate: {
          "Foo": {
            "baz_sum": { "sum": "Baz" },
            "count": { "count": "Baz" },
            "dt_min": { "min": "Dt Test" },
            "dt_max": { "max": "Dt Test" }
          }
        },
        "order": { "baz_sum": "desc" },
        "count": 5
      }
    },
    terminal: {
      output: './test/data/output/memory/aggregate_3.json'
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await tests()) return 1;
};
