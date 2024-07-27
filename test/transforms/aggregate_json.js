/**
 * test/json
 */
"use strict";

const transfer = require('../_lib/_transfer');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: aggregate json");

async function testSummary() {

  logger.info("=== json aggregate summary");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foo_data.json|*",
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
      "smt": 'json|./test/_data/output/transforms/|aggregate_summary.json|*',
      options: {
        addHeader: true,
        encoding: { totals: "keyword", count: "integer", qty: "number", value: "number" }
      },
      output: "./test/_data/output/transforms/aggregate_summary.json"
    }
  })) return 1;
}

async function testGroupBy() {
  logger.info("=== json aggregate group by");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foo_data.json|*",
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
      "smt": 'json|./test/_data/output/transforms/|aggregate_groupby.json|*',
      options: {
        addHeader: true,
        encoding: { category: "keyword", count: "integer", qty: "number", value: "number" }
      },
      output: "./test/_data/output/transforms/aggregate_groupby.json"
    }
  })) return 1;
}

async function testNestedGroupBy() {
  logger.info("=== json aggregate nested group by");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foo_data.json|*",
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
      "smt": 'json|./test/_data/output/transforms/|aggregate_nested.json|*',
      options: {
        addHeader: true,
        encoding: { category: "keyword", item: "keyword", count: "integer", qty: "number", value: "number" }
      },
      output: "./test/_data/output/transforms/aggregate_nested.json"
    }
  })) return 1;
}

async function testMultipleGroupBy() {
  logger.info("=== json aggregate multiple group by");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foo_data.json|*",
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
      "smt": 'json|./test/_data/output/transforms/|aggregate_multiple.json|*',
      options: {
        addHeader: true,
        encoding: { category: "keyword", item: "keyword", count: "integer", qty: "number", value: "number" }
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
