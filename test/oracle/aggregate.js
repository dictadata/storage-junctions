/**
 * test/mysql
 */
"use strict";

const retrieve = require('../lib/_retrieve');
const logger = require('../../lib/logger');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== mysql aggregate");
  await retrieve({
    origin: {
      smt: "mysql|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
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
      output: './test/output/mysql_aggregate_1.json'
    }
  });

  logger.info("=== mysql groupby with summary");
  await retrieve({
    origin: {
      smt: "mysql|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
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
      output: './test/output/mysql_aggregate_2.json'
    }
  });

  logger.info("=== mysql aggregate w/ groupby");
  await retrieve({
    origin: {
      smt: "mysql|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      pattern: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        },
        aggregate: {
          "Foo": {
            "baz_sum": { "sum": "Baz" },
            "count": { "count": "Baz" }
          }
        },
        "order": { "baz_sum": "desc" },
        "count": 5
      }
    },
    terminal: {
      output: './test/output/mysql_aggregate_3.json'
    }
  });

}

tests();
