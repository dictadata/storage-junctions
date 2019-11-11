/**
 * test/mysql
 */
"use strict";

const recall = require('./_recall');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql recall");
  await recall({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|=Foo",
      pattern: {
        Foo: 'twenty'
      }
    }
  });

  logger.info("=== mysql recall");
  await recall({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
      pattern: {
        Foo: 'twenty'
      }
    }
  });

}

tests();
