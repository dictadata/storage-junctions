/**
 * test/elasticsearch
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== elasticsearch consolidate");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        consolidate: {
          "baz_sum": { "sum": "Baz" },
          "fobe_max": { "max": "Fobe" }
        }
      }
    },
    outputFile: './test/output/elasticsearch_consolidate_1.json'
  });

  logger.info("=== elasticsearch consolidate w/ groupby");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        },
        consolidate: {
          "Foo": {
            "baz_sum": { "sum": "Baz" }
          }
        },
        "cues": {
          "order": { "baz_sum": "desc" },
          "count": 5
        }
      }
    },
    outputFile: './test/output/elasticsearch_consolidate_2.json'
  });

  logger.info("=== elasticsearch groupby with summary");
  await retrieve({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        },
        consolidate: {
          "Dt Test": {
            "baz_sum": { "sum": "Baz" }
          },
          "baz_sum": { "sum": "Baz" }
        },
        cues: {
          "order": { "baz_sum": "desc" },
          "count": 10
        }
      }
    },
    outputFile: './test/output/elasticsearch_consolidate_3.json'
  });

}

tests();
