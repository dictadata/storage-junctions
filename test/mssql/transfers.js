/**
 * test/mssql
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: mssql transfers");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  await dullSchema({
    smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_transfer|*"
  });

  logger.info("=== foofile.csv > mssql");
  await transfer({
    origin: {
      smt: "csv|./data/test/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo"
    }
  });

  logger.info("=== foofile_01.json > mssql");
  await transfer({
    origin: {
      smt: "json|./data/test/|foofile_01.json|*" 
    },
    terminal: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|=Foo",
      options: {
        encoding: "./data/test/encoding_foo_01.json"
      }
    }
  });

  logger.info("=== foofile_02.json > mssql");
  await transfer({
    origin: {
      smt: "json|./data/test/|foofile_02.json|*" 
    },
    terminal: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|=Foo",
      options: {
        encoding: "./data/test/encoding_foo_02.json"
      }
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
      smt: "csv|./data/output/mssql/|transfer.csv|*",
      options: {
        header: true
      }
    }
  });
}

(async () => {
  await tests();
})();
