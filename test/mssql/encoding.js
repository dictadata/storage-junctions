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
      encoding: "./test/data/encoding_foo.json"
    }
  });

  logger.info("=== mssql getEncoding");
  await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      output: './test/output/mssql_encoding_foo.json'
    }
  });


  logger.info("=== mssql putEncoding");
  await putEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|*",
      encoding: "./test/data/encoding_foo_01.json"
    }
  });

  logger.info("=== mssql getEncoding");
  await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|*"
    },
    terminal: {
      output: './test/output/mssql_encoding_foo_01.json'
    }
  });


  logger.info("=== mssql putEncoding");
  await putEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|*",
      encoding: "./test/data/encoding_foo_02.json"
    }
  });

  logger.info("=== mssql getEncoding");
  await getEncoding({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|*"
    },
    terminal: {
      output: './test/output/mssql_encoding_foo_02.json'
    }
  });

}

tests();
