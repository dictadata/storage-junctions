/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== json aggregate");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    "transform": {
      filter: {
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      aggregate: {
        "baz_sum": { "sum": "Baz" },
        "fobe_max": { "max": "Fobe" }
      }
    },
    terminal: {
      "smt": 'json|./data/output/transforms/|json_aggregate_1.json|*',
      "output": "./data/output/transforms/json_aggregate_1.json"
    }
  })) return 1;

  logger.info("=== json aggregate summary");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*",
    },
    "transform": {
      filter: {
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      aggregate: {
        "sum": { "sum": "Baz" },
        "avg": { "avg": "Baz" },
        "min": { "min": "Baz" },
        "max": { "max": "Baz" },
        "count": { "count": "Baz" }
      }
    },
    terminal: {
      "smt": 'json|./data/output/transforms/|json_aggregate_2.json|*',
      "output": "./data/output/transforms/json_aggregate_2.json"
    }
  })) return 1;

  logger.info("=== json aggregate w/ groupby");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    transform: {
      filter: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      aggregate: {
        "Foo": {
          "baz_sum": { "sum": "Baz" },
          "count": { "count": "Baz" },
          "dt_min": { "min": "Dt Test" },
          "dt_max": { "max": "Dt Test" }
        }
      }
    },
    terminal: {
      "smt": 'json|./data/output/transforms/|json_aggregate_3.json|*',
      "output": "./data/output/transforms/json_aggregate_3.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
