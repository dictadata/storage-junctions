/**
 * test/mysql
 */
"use strict";

const getEncoding = require('./_getEncoding');
const putEncoding = require('./_putEncoding');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql getEncoding");
  await getEncoding({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*"
    },
    OutputFile: './test/output/mysql_foo_encoding.json'
  });

  logger.info("=== mysql putEncoding");
  await putEncoding({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*"
    }
  });

}

tests();
