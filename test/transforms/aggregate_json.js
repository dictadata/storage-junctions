/**
 * test/json
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: retrieve");

async function testSummary() {

  logger.info("=== json aggregate summary");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foodata.json|*",
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
      "smt": 'json|./test/_data/output/transforms/|aggregate_summary.json|*',
      options: {
        header: true,
        encoding: {}
      },
      output: "./test/_data/output/transforms/aggregate_summary.json"
    }
  })) return 1;
}

async function testGroupBy() {
  logger.info("=== json aggregate group by");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foodata.json|*",
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
      "smt": 'json|./test/_data/output/transforms/|aggregate_groupby.json|*',
      options: {
        header: true
      },
      output: "./test/_data/output/transforms/aggregate_groupby.json"
    }
  })) return 1;
}

async function testNestedGroupBy() {
  logger.info("=== json aggregate nested group by");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foodata.json|*",
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
      "smt": 'json|./test/_data/output/transforms/|aggregate_nested.json|*',
      options: {
        header: true
      },
      output: "./test/_data/output/transforms/aggregate_nested.json"
    }
  })) return 1;
}

async function testMultipleGroupBy() {
  logger.info("=== json aggregate multiple group by");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foodata.json|*",
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
      "smt": 'json|./test/_data/output/transforms/|aggregate_multiple.json|*',
      options: {
        header: true
      },
      output: "./test/_data/output/transforms/aggregate_multiple.json"
    }
  })) return 1;
}

(async () => {
  if (await testSummary()) return;
  if (await testGroupBy()) return;
  if (await testNestedGroupBy()) return;
  if (await testMultipleGroupBy()) return;
})();
