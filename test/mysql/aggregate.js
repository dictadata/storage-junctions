/**
 * test/mysql
 */
"use strict";

const retrieve = require('../_lib/_retrieve');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: retrieve");

async function tests() {

  logger.info("=== mysql aggregate");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*",
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
      output: './test/_data/output/mysql/aggregate_1.json'
    }
  })) return 1;

  logger.info("=== mysql aggregate summary");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*",
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
      output: './test/_data/output/mysql/aggregate_2.json'
    }
  })) return 1;

  logger.info("=== mysql aggregate w/ groupby");
  if (await retrieve({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*",
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
      output: './test/_data/output/mysql/aggregate_3.json'
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
