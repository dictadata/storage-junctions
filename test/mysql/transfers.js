/**
 * test/mysql
 */
"use strict";

const transfer = require('../_lib/_transfer');
const dullSchema = require('../_lib/_dullSchema');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: mysql transfers");

async function tests() {

  logger.info("=== dullSchema foo_transfer");
  if (await dullSchema({
    smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_transfer|*"
  })) return 1;

  logger.info("=== foofile.csv > mysql.foo_schema");
  if (await transfer({
    origin: {
      smt: "csv|./test/_data/input/|foofile.csv|*",
      options: {
        hasHeader: true
      }
    },
    terminal: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*"
    }
  })) return 1;

  logger.info("=== foofile_01.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile_01.json|*"
    },
    terminal: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema_01|=Foo",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema_01.engram.json"
      }
    }
  })) return 1;

  logger.info("=== foo_widgets.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foo_widgets.json|*"
    },
    terminal: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_widgets|=Foo",
      options: {
        encoding: "./test/_data/input/engrams/foo_widgets.engram.json"
      }
    }
  })) return 1;

  logger.info("=== foofile_two.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./test/_data/input/|foofile_two.json|*"
    },
    terminal: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema_two|*",
      options: {
        encoding: "./test/_data/input/engrams/foo_schema_two.engram.json"
      }
    }
  })) return 1;

  logger.info("=== mysql.foo_schema > mysql.foo_transfer");
  if (await transfer({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|*"
    },
    terminal: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_transfer|*"
    }
  })) return 1;

  logger.info("=== mysql.foo_transfer > mysql_transfer.csv");
  if (await transfer({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./test/_data/output/mysql/|transfer.csv|*",
      options: {
        addHeader: true
      },
      output: "./test/_data/output/mysql/transfer.csv"
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
