/**
 * test/mysql
 */
"use strict";

const store = require('./_store');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql store");
  await store({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== mysql store");
  await store({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 30,
      enabled: false
    }
  });

}

tests();
