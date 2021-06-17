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
    smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_transfer|*"
  })) return 1;

  logger.info("=== foofile.csv > mysql.foo_schema");
  if (await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*"
    }
  })) return 1;

  logger.info("=== foofile_01.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*" 
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|=Foo",
      options: {
        encoding: "./test/data/encoding_foo_01.json"
      }
    }
  })) return 1;

  logger.info("=== foofile_02.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*" 
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|=Foo",
      options: {
        encoding: "./test/data/encoding_foo_02.json"
      }
    }
  })) return 1;

  logger.info("=== foofile_two.json > mysql");
  if (await transfer({
    origin: {
      smt: "json|./test/data/|foofile_two.json|*" 
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_two|*",
      options: {
        encoding: "./test/data/encoding_foo_two.json"
      }
    }
  })) return 1;

  logger.info("=== mysql.foo_schema > mysql.foo_transfer");
  if (await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_transfer|*"
    }
  })) return 1;

  logger.info("=== mysql.foo_transfer > mysql_transfer.csv");
  if (await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./test/data/output/mysql/|transfer.csv|*",
      options: {
        header: true
      }
    }
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
