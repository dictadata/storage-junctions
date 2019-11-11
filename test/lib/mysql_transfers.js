/**
 * test/mysql
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql writer");
  await transfer({
    source: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    destination: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_transfer|*"
    }
  });

  logger.info("=== mysql reader");
  await transfer({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_transfer|*"
    },
    destination: {
      smt: "csv|./test/output/|mysql_output.csv|*"
    }
  });
}

tests();
