/**
 * test/mssql
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql putEncoding");
  await putEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      encoding: "./test/data/foo_encoding.json"
    }
  });

  logger.info("=== mssql getEncoding");
  await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      output: './test/output/mssql_foo_encoding.json'
    }
  });

}

tests();
