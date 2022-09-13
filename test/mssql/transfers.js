/**
 * test/mssql
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql transfers");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "mssql|server=localhost;database=storage_node|foo_transfer|*"
  })) return 1;

  logger.info("=== foofile.csv > mssql");
  if (await transfer({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "mssql|server=localhost;database=storage_node|foo_schema|=Foo"
    }
  })) return 1;

  logger.info("=== foofile_01.json > mssql");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "mssql|server=localhost;database=storage_node|foo_schema_01|=Foo",
      options: {
        encoding: "./data/input/foo_schema_01.encoding.json"
      }
    }
  })) return 1;

  logger.info("=== foofile_02.json > mssql");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_02.json|*"
    },
    terminal: {
      smt: "mssql|server=localhost;database=storage_node|foo_schema_02|=Foo",
      options: {
        encoding: "./data/input/foo_schema_02.encoding.json"
      }
    }
  })) return 1;

  logger.info("=== mssql > mssql foo_transfer");
  if (await transfer({
    origin: {
      smt: "mssql|server=localhost;database=storage_node|foo_schema|=Foo"
    },
    terminal: {
      smt: "mssql|server=localhost;database=storage_node|foo_transfer|=Foo"
    }
  })) return 1;

  logger.info("=== mssql > mssql_transfer.csv");
  if (await transfer({
    origin: {
      smt: "mssql|server=localhost;database=storage_node|foo_transfer|=Foo"
    },
    terminal: {
      smt: "csv|./data/output/mssql/|transfer.csv|*",
      options: {
        header: true
      },
      output: "./data/output/mssql/transfer.csv"
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
