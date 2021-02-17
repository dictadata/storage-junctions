/**
 * test/mysql
 */
"use strict";

const transfer = require('../lib/_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql transfers");

async function tests() {

  logger.info("=== foofile_two.json > mysql");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_two.json|*" 
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_two|*",
      encoding: "./test/data/encoding_foo_two.json"
    }
  });

  logger.info("=== foofile.csv > mysql.foo_schema");
  await transfer({
    origin: {
      smt: "csv|./test/data/|foofile.csv|*",
      options: {
        header: true
      }
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*"
    }
  });

  logger.info("=== foofile_01.json > mysql");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*" 
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|=Foo",
      encoding: "./test/data/encoding_foo_01.json"
    }
  });

  logger.info("=== foofile_02.json > mysql");
  await transfer({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*" 
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|=Foo",
      encoding: "./test/data/encoding_foo_02.json"
    }
  });

  logger.info("=== mysql.foo_schema > mysql.foo_transfer");
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*"
    },
    terminal: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_transfer|*"
    }
  });

  logger.info("=== mysql.foo_transfer > mysql_transfer.csv");
  await transfer({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_transfer|*"
    },
    terminal: {
      smt: "csv|./output/mysql/|transfer.csv|*",
      options: {
        header: true
      }
    }
  });
}

(async () => {
  await tests();
})();
