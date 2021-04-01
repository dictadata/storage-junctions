/**
 * test/mssql
 */
"use strict";

const store = require('../lib/_store');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql store 20");
  if (await store({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  })) return 1;

  logger.info("=== mssql store 30");
  if (await store({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 30,
      enabled: false
    }
  })) return 1;

  logger.info("=== mssql store 10");
  if (await store({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'ten',
      Bar: 'Hamilton',
      Baz: 10,
      enabled: false
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
