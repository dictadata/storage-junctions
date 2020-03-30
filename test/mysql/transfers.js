/**
 * test/mysql
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== foofile.csv > mysql");
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*"
    }
  });

  logger.info("=== mysql > mysql foo_transfer");
  await transfer({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*"
    },
    destination: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_transfer|*"
    }
  });

  logger.info("=== mysql > mysql_transfer.csv");
  await transfer({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_transfer|*"
    },
    destination: {
      smt: "csv|./test/output/|mysql_transfer.csv|*"
    }
  });
}

tests();
