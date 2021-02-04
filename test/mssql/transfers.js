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
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo"
    }
  });

  logger.info("=== foofile_01.json > mssql");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*" 
    },
    terminal: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|=Foo",
      encoding: "./test/data/encoding_foo_01.json"
    }
  });

  logger.info("=== foofile_02.json > mssql");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*" 
    },
    terminal: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|=Foo",
      encoding: "./test/data/encoding_foo_02.json"
    }
  });

  logger.info("=== mssql > mssql foo_transfer");
  await transfer({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo"
    },
    terminal: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_transfer|=Foo"
    }
  });

  logger.info("=== mssql > mssql_transfer.csv");
  await transfer({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_transfer|=Foo"
    },
    terminal: {
      smt: "csv|./output/|mssql_transfer.csv|*",
      options: {
        csvHeader: true
      }
    }
  });
}

tests();
