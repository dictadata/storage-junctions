/**
 * test/mysql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql putEncoding");
  await putEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*"
    }
  });

  logger.info("=== mysql getEncoding");
  await getEncoding({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*"
    },
    terminal: {
      output: './test/output/mysql_foo_encoding.json'
    }
  });

}

tests();
