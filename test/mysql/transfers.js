/**
 * test/mysql
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mysql transfers");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "mysql|host=localhost;database=storage_node|foo_transfer|*"
  })) return 1;

  logger.info("=== foofile.csv > mysql.foo_schema");
  if (await transfer({
    origin: {
      smt: "csv|./data/input/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "mysql|host=localhost;database=storage_node|foo_schema|*"
    }
  })) return 1;

  logger.info("=== foofile_01.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "mysql|host=localhost;database=storage_node|foo_schema_01|=Foo",
      options: {
        encoding: "./data/input/foo_schema_01.encoding.json"
      }
    }
  })) return 1;

  logger.info("=== foofile_02.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_02.json|*"
    },
    terminal: {
      smt: "mysql|host=localhost;database=storage_node|foo_schema_02|=Foo",
      options: {
        encoding: "./data/input/foo_schema_02.encoding.json"
      }
    }
  })) return 1;

  logger.info("=== foofile_two.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./data/input/|foofile_two.json|*"
    },
    terminal: {
      smt: "mysql|host=localhost;database=storage_node|foo_schema_two|*",
      options: {
        encoding: "./data/input/foo_schema_two.encoding.json"
      }
    }
  })) return 1;

  logger.info("=== mysql.foo_schema > mysql.foo_transfer");
  if (await transfer({
    origin: {
      smt: "mysql|host=localhost;database=storage_node|foo_schema|*"
    },
    terminal: {
      smt: "mysql|host=localhost;database=storage_node|foo_transfer|*"
    }
  })) return 1;

  logger.info("=== mysql.foo_transfer > mysql_transfer.csv");
  if (await transfer({
    origin: {
      smt: "mysql|host=localhost;database=storage_node|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./data/output/mysql/|transfer.csv|*",
      options: {
        header: true
      },
      output: "./data/output/mysql/transfer.csv"
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
