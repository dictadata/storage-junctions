/**
 * test/mysql
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== mysql consolidate");
  await retrieve({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
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
    terminal: './test/output/mysql_consolidate_1.json'
  });

  logger.info("=== mysql consolidate w/ groupby");
  await retrieve({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
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
    terminal: './test/output/mysql_consolidate_2.json'
  });

  logger.info("=== mysql groupby with summary");
  await retrieve({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
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
    terminal: './test/output/mysql_consolidate_3.json'
  });

}

tests();
