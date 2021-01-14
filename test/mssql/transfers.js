/**
 * test/mssql
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: mssql transfers");

async function tests() {

  logger.info("=== foofile.csv > mssql");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*"
    }
  });

  logger.info("=== mssql > mssql foo_transfer");
  await transfer({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_transfer|*"
    }
  });

  logger.info("=== mssql > mssql_transfer.csv");
  await transfer({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./test/output/|mssql_transfer.csv|*",
      options: {
        csvHeader: true
      }
    }
  });
}

tests();
