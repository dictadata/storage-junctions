/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== csv aggregate");
  if (await transfer({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    "transform": {
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
      "smt": 'csv|./data/output/transforms/|csv_aggregate_1.csv|*',
      options: {
        header: true
      },
      output: "./data/output/transforms/csv_aggregate_1.csv"
    }
  })) return 1;

  logger.info("=== csv aggregate summary");
  if (await transfer({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    "transform": {
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
      "smt": 'csv|./data/output/transforms/|csv_aggregate_2.csv|*',
      options: {
        header: true
      },
      output: "./data/output/transforms/csv_aggregate_2.csv"
    }
  })) return 1;

  logger.info("=== csv aggregate w/ groupby");
  if (await transfer({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    transform: {
      filter: {
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      aggregate: {
        "Foo": {
          "baz_sum": { "sum": "Baz" },
          "count": { "count": "Baz" },
          "dt_min": { "min": "Dt Test" },
          "dt_max": { "max": "Dt Test" }
        }
      }
    },
    terminal: {
      "smt": 'csv|./data/output/transforms/|csv_aggregate_3.csv|*',
      options: {
        header: true
      },
      output: "./data/output/transforms/csv_aggregate_3.csv"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
