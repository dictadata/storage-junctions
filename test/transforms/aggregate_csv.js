/**
 * test/csv
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: retrieve");

async function testSummary() {

  logger.info("=== csv aggregate summary");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foodata.csv|*",
      options: {
        header: true
      }
    },
    transforms: [
      {
        transform: "aggregate",
        fields: {
          "__summary": {
            "totals": "totals",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          }
        }
      }
    ],
    terminal: {
      "smt": 'csv|./test/_data/output/transforms/|aggregate_summary.csv|*',
      options: {
        header: true,
        encoding: {}
      },
      output: "./test/_data/output/transforms/aggregate_summary.csv"
    }
  })) return 1;
}

async function testGroupBy() {
  logger.info("=== csv aggregate group by");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foodata.csv|*",
      options: {
        header: true
      }
    },
    transforms: [
      {
        transform: "aggregate",
        fields: {
          "category": {
            "count": "=count()",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          },
          "__summary": {
            "category": "totals",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          }
        }
      }
    ],
    terminal: {
      "smt": 'csv|./test/_data/output/transforms/|aggregate_groupby.csv|*',
      options: {
        header: true
      },
      output: "./test/_data/output/transforms/aggregate_groupby.csv"
    }
  })) return 1;
}

async function testNestedGroupBy() {
  logger.info("=== csv aggregate nested group by");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foodata.csv|*",
      options: {
        header: true
      }
    },
    transforms: [
      {
        transform: "aggregate",
        "fields": {
          "category": {
            "item": {
              "count": "=count()",
              "qty": "=sum(quantity)",
              "value": "=sum(quantity*cost)"
            }
          }
        }
      }
    ],
    terminal: {
      "smt": 'csv|./test/_data/output/transforms/|aggregate_nested.csv|*',
      options: {
        header: true
      },
      output: "./test/_data/output/transforms/aggregate_nested.csv"
    }
  })) return 1;
}

async function testMultipleGroupBy() {
  logger.info("=== csv aggregate multiple group by");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foodata.csv|*",
      options: {
        header: true
      }
    },
    transforms: [
      {
        transform: "aggregate",
        "fields": {
          "category": {
            "count": "=count()",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          },
          "item": {
            "count": "=count()",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
            },
          "__summary": {
            "category": "totals",
            "count": "=count(item)",
            "qty": "=sum(quantity)",
            "value": "=sum(quantity*cost)"
          }
        }
      }
    ],
    terminal: {
      "smt": 'csv|./test/_data/output/transforms/|aggregate_multiple.csv|*',
      options: {
        header: true
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
