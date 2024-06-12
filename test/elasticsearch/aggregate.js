/**
 * test/elasticsearch
 */
"use strict";

const retrieve = require('../_retrieve');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== elasticsearch aggregate");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
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
      output: './test/data/output/elasticsearch/aggregate_1.json'
    }
  })) return 1;

  logger.info("=== elasticsearch aggregate summary");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
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
      output: './test/data/output/elasticsearch/aggregate_2.json'
    }
  })) return 1;

  logger.info("=== elasticsearch aggregate w/ groupby");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|*",
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
      output: './test/data/output/elasticsearch/aggregate_3.json'
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
