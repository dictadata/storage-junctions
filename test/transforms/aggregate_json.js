/**
 * test/json
 */
"use strict";

const transfer = require('../_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== json aggregate");
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*"
    },
    transforms: [
      {
        transform: "filter",
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      {
        transform: "aggregate",
        "fields": {
          "baz_sum": { "sum": "Baz" },
          "fobe_min": { "min": "Fobe" },
          "fobe_max": { "max": "Fobe" }
        }
      }
    ],
    terminal: {
      "smt": 'json|./test/data/output/transforms/|aggregate_json_1.json|*',
      "output": "./test/data/output/transforms/aggregate_json_1.json"
    }
  })) return 1;

  logger.info("=== json aggregate summary");
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*",
    },
    transforms: [
      {
        transform: "filter",
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      {
        transform: "aggregate",
        "fields": {
          "sum": { "sum": "Baz" },
          "avg": { "avg": "Baz" },
          "min": { "min": "Baz" },
          "max": { "max": "Baz" },
          "count": { "count": "Baz" }
        }
      }
    ],
    terminal: {
      "smt": 'json|./test/data/output/transforms/|aggregate_json_2.json|*',
      "output": "./test/data/output/transforms/aggregate_json_2.json"
    }
  })) return 1;

  logger.info("=== json aggregate w/ groupby");
  if (await transfer({
    origin: {
      smt: "json|./test/data/input/|foofile.json|*"
    },
    transforms: [
      {
        transform: "filter",
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      {
        transform: "aggregate",
        "fields": {
          "Foo": {
            "baz_sum": { "sum": "Baz" },
            "count": { "count": "Baz" },
            "dt_min": { "min": "Dt Test" },
            "dt_max": { "max": "Dt Test" }
          }
        }
      }
    ],
    terminal: {
      "smt": 'json|./test/data/output/transforms/|aggregate_json_3.json|*',
      "output": "./test/data/output/transforms/aggregate_json_3.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
