/**
 * test/elasticsearch
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../storage/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch retrieve");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Bar": { 'wc': 'row*' }
        },
        order: { "Foo": "asc" }
      }
    },
    terminal: {
      output: "./data/output/elasticsearch/retrieve_1.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve w/ cues");
  if (await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_01|*",
      pattern: {
        "order": { "Foo": "asc" },
        "count": 5
      }
    },
    terminal: {
      output: "./data/output/elasticsearch/retrieve_2.json"
    }
  })) return 1;

  logger.info("=== elasticsearch retrieve w/ pattern");
  if (await retrieve({
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
      output: "./data/output/elasticsearch/retrieve_3.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
