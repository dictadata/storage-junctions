/**
 * test/elasticsearch
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== elasticsearch aggregate");
  await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
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
      output: './output/elasticsearch_aggregate_1.json'
    }
  });

  logger.info("=== elasticsearch aggregate summary");
  await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
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
      output: './output/elasticsearch_aggregate_2.json'
    }
  });

  logger.info("=== elasticsearch aggregate w/ groupby");
  await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
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
      output: './output/elasticsearch_aggregate_3.json'
    }
  });

}

(async () => {
  await tests();
})();
