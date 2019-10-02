/**
 * test/mysql
 */
"use strict";

const getEncoding = require('./_getEncoding');
const putEncoding = require('./_putEncoding');
const store = require('./_store');
const recall = require('./_recall');
const retrieve = require('./_retrieve');
const transfer = require('./_transfer');
const dull = require('./_dull');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== elasticsearch getEncoding");
  await getEncoding({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*"
  });

  logger.info("=== elasticsearch putEncoding");
  await putEncoding({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*"
  });

  logger.info("=== mysql store");
  await store({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|=Foo",
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== mysql recall");
  await recall({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|=Foo",
    options: {
      Foo: 'twenty'
    }
  });

  logger.info("=== mysql recall");
  await recall({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*",
    options: {
      Foo: 'twenty'
    }
  });

  logger.info("=== mysql retrieve");
  await retrieve({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*",
    options: {
      pattern: {
        filter: {
          "Foo": 'twenty'
        }
      }
    }
  });

  logger.info("=== mysql dull");
  await dull({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_schema|*",
    options: {
      Foo: 'twenty'
    }
  });

  logger.info("=== mysql writer");
  await transfer({
    src_smt: "csv|./test/data/|testfile.csv|*",
    dst_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_writer|*"
  });

  logger.info("=== mysql reader");
  await transfer({
    src_smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|test_writer|*",
    dst_smt: "csv|./test/output/|mysql_output.csv|*"
  });
}

tests();
