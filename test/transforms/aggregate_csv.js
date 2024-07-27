/**
 * test/csv
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: aggregate csv");

async function testSummary() {

  logger.info("=== csv aggregate summary");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foo_data.csv|*",
      options: {
        hasHeader: true,
        encoding: "./test/_data/input/engrams/foo_data.engram.json"
      }
    },
    transforms: [
      {
        transform: "aggregate",
        fields: [
          {
            "totals": "totals",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          }
        ]
      }
    ],
    terminal: {
      "smt": 'csv|./test/_data/output/transforms/|aggregate_summary.csv|*',
      options: {
        addHeader: true,
        encoding: { totals: "keyword", count: "integer", qty: "number", value: "number" }
      },
      output: "./test/_data/output/transforms/aggregate_summary.csv"
    }
  })) return 1;
}

async function testGroupBy() {
  logger.info("=== csv aggregate group by");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foo_data.csv|*",
      options: {
        hasHeader: true,
        encoding: "./test/_data/input/engrams/foo_data.engram.json"
      }
    },
    transforms: [
      {
        transform: "aggregate",
        fields: [
          {
            "_groupby": "category",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          },
          {
            "category": "totals",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          }
        ]
      }
    ],
    terminal: {
      "smt": 'csv|./test/_data/output/transforms/|aggregate_groupby.csv|*',
      options: {
        addHeader: true,
        encoding: { category: "keyword", count: "integer", qty: "number", value: "number" }
      },
      output: "./test/_data/output/transforms/aggregate_groupby.csv"
    }
  })) return 1;
}

async function testNestedGroupBy() {
  logger.info("=== csv aggregate nested group by");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foo_data.csv|*",
      options: {
        hasHeader: true,
        encoding: "./test/_data/input/engrams/foo_data.engram.json"
      }
    },
    transforms: [
      {
        transform: "aggregate",
        "fields": [
          {
            "_groupby": [ "category", "item" ],
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          }
        ]
      }
    ],
    terminal: {
      "smt": 'csv|./test/_data/output/transforms/|aggregate_nested.csv|*',
      options: {
        addHeader: true,
        encoding: { category: "keyword", item: "keyword", count: "integer", qty: "number", value: "number" }
      },
      output: "./test/_data/output/transforms/aggregate_nested.csv"
    }
  })) return 1;
}

async function testMultipleGroupBy() {
  logger.info("=== csv aggregate multiple group by");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foo_data.csv|*",
      options: {
        hasHeader: true,
        encoding: "./test/_data/input/engrams/foo_data.engram.json"
      }
    },
    transforms: [
      {
        transform: "aggregate",
        "fields": [
          {
            "_groupby": "category",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          },
          {
            "_groupby": "item",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          },
          {
            "category": "totals",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          }
        ]
      }
    ],
    terminal: {
      "smt": 'csv|./test/_data/output/transforms/|aggregate_multiple.csv|*',
      options: {
        addHeader: true,
        encoding: { category: "keyword", item: "keyword", count: "integer", qty: "number", value: "number" }
      },
      output: "./test/_data/output/transforms/aggregate_multiple.csv"
    }
  })) return 1;
}

(async () => {
  if (await testSummary()) return;
  if (await testGroupBy()) return;
  if (await testNestedGroupBy()) return;
  if (await testMultipleGroupBy()) return;
})();
