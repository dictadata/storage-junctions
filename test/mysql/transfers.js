/**
 * test/mysql
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql transfers");

async function tests() {

  logger.info("=== foofile.csv > mysql.foo_schema");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        csvHeader: true
      }
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*"
    }
  });

  logger.info("=== mysql.foo_schema > mysql.foo_transfer");
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_transfer|*"
    }
  });

  logger.info("=== mysql.foo_transfer > mysql_transfer.csv");
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./test/output/|mysql_transfer.csv|*",
      options: {
        csvHeader: true
      }
    }
  });
}

tests();
