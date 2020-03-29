/**
 * test/mysql
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql retrieve");
  await retrieve({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          "Foo": 'ten'
        }
      }
    }
  });

  logger.info("=== mysql retrieve w/ cues");
  await retrieve({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
      pattern: {
        cues: {
          "order": { "Foo": "asc" },
          "count": 100
        }
      }
    }
  });

  logger.info("=== mysql retrieve with pattern");
  await retrieve({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_transfer|*",
      pattern: {
        match: {
          "Foo": "first",
          "Baz": { "gte": 0, "lte": 1000 }
        },
        cues: {
          count: 3,
          order: { "Dt Test": "asc" },
          fields: ["Foo","Baz"]
        }
      }
    }
  });

}

tests();
