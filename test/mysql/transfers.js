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
    origin: {
      smt: "csv|./test/data/|foofile.csv|*"
    },
    terminus: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*"
    }
  });

  logger.info("=== mysql > mysql foo_transfer");
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*"
    },
    terminus: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_transfer|*"
    }
  });

  logger.info("=== mysql > mysql_transfer.csv");
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_transfer|*"
    },
    terminus: {
      smt: "csv|./test/output/|mysql_transfer.csv|*"
    }
  });
}

tests();
