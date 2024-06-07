/**
 * test/csv
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: retreive");

async function tests() {

  logger.info("=== csv aggregate");
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    transforms: [
      {
        transform: "filter",
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      {
        transform: "aggregate",
        "fields": {
          "baz_sum": { "sum": "Baz" },
          "fobe_min": { "min": "Fobe" },
          "fobe_max": { "max": "Fobe" }
        }
      }
    ],
    terminal: {
      "smt": 'csv|./test/data/output/transforms/|aggregate_csv_1.csv|*',
      options: {
        header: true,
        encoding: {
          "fields": [
            { "name": "baz_sum", "type": "integer" },
            { "name": "fobe_min", "type": "number" },
            { "name": "fobe_max", "type": "number" }
          ]
        }
      },
      output: "./test/data/output/transforms/aggregate_csv_1.csv"
    }
  })) return 1;

  logger.info("=== csv aggregate summary");
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    transforms: [
      {
        transform: "filter",
        match: {
          "Bar": "row",
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      {
        transform: "aggregate",
        fields: {
          "sum": { "sum": "Baz" },
          "avg": { "avg": "Baz" },
          "min": { "min": "Baz" },
          "max": { "max": "Baz" },
          "count": { "count": "Baz" }
        }
      }
    ],
    terminal: {
      "smt": 'csv|./test/data/output/transforms/|aggregate_csv_2.csv|*',
      options: {
        header: true
      },
      output: "./test/data/output/transforms/aggregate_csv_2.csv"
    }
  })) return 1;

  logger.info("=== csv aggregate w/ groupby");
  if (await transfer({
    origin: {
      smt: "csv|./test/data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    transforms: [
      {
        transform: "filter",
        match: {
          "Baz": { "gte": 0, "lte": 1000 }
        }
      },
      {
        transform: "aggregate",
        "fields": {
          "Foo": {
            "baz_sum": { "sum": "Baz" },
            "count": { "count": "Baz" },
            "dt_min": { "min": "Dt Test" },
            "dt_max": { "max": "Dt Test" }
          }
        }
      }
    ],
    terminal: {
      "smt": 'csv|./test/data/output/transforms/|aggregate_csv_3.csv|*',
      options: {
        header: true
      },
      output: "./test/data/output/transforms/aggregate_csv_3.csv"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
