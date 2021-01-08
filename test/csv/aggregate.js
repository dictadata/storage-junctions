/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== csv aggregate");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    "transforms": {
      filter: {
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      aggregate: {
        "baz_sum": { "sum": "Baz" },
        "fobe_max": { "max": "Fobe" }
      }
    },
    terminal: {
      "smt": 'csv|./test/output/|csv_aggregate_1.csv|*'
    }
  });

  logger.info("=== csv groupby with summary");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    "transforms": {
      filter: {
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      aggregate: {
        "sum": { "sum": "Baz" },
        "avg": { "avg": "Baz" },
        "min": { "min": "Baz" },
        "max": { "max": "Baz" },
        "count": { "count": "Baz" }
      }
    },
    terminal: {
      "smt": 'csv|./test/output/|csv_aggregate_2.csv|*'
    }
  });

  logger.info("=== csv aggregate w/ groupby");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    transforms: {
      filter: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      aggregate: {
        "Foo": {
          "baz_sum": { "sum": "Baz" },
          "count": { "count": "Baz" }
        }
      }
    },
    terminal: {
      "smt": 'csv|./test/output/|csv_aggregate_3.csv|*'
    }
  });

}

tests();
