/**
 * test/json
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== json aggregate");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    "transforms": {
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
      "smt": 'json|./output/|json_aggregate_1.json|*'
    }
  });

  logger.info("=== json aggregate summary");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*",
    },
    "transforms": {
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
      "smt": 'json|./output/|json_aggregate_2.json|*'
    }
  });

  logger.info("=== json aggregate w/ groupby");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    transforms: {
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
      "smt": 'json|./output/|json_aggregate_3.json|*'
    }
  });

}

(async () => {
  await tests();
})();
