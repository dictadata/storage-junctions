/**
 * test/elasticsearch
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch retrieve");
  await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        }
      }
    },
    terminal: {
      output: "./output/elasticsearch_retrieve_1.json"
    }
  });

  logger.info("=== elasticsearch retrieve w/ cues");
  await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_01|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 100
      }
    },
    terminal: {
      output: "./output/elasticsearch_retrieve_2.json"
    }
  });

  logger.info("=== elasticsearch retrieve w/ pattern");
  await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_02|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        count: 3,
        order: { "Dt Test": "asc" },
        fields: ["Foo", "Baz", "tags", "widgets"]
      }
    },
    terminal: {
      output: "./output/elasticsearch_retrieve_3.json"
    }
  });

}

tests();
