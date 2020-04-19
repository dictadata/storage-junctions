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
          "Foo": 'twenty'
        }
      }
    }
  });

  logger.info("=== elasticsearch retrieve w/ cues");
  await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        cues: {
          "order": { "Foo": "asc" },
          "count": 100
        }
      }
    }
  });

  logger.info("=== elasticsearch retrieve w/ pattern");
  await retrieve({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        cues: {
          count: 3,
          order: { "Dt Test": "asc" },
          fields: ["Foo", "Baz"]
        }
      }
    }
  });

}

tests();
