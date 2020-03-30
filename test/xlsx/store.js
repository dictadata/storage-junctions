/**
 * test/xlsx/store
 */
"use strict";

const store = require('../lib/_store');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx");


async function tests() {

  logger.info("=== xlsx store 20");
  await store({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|=Foo",
      options: {
        logger: logger
      }
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== xlsx store 30");
  await store({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|=Foo",
      options: {
        logger: logger
      }
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 30,
      enabled: false
    }
  });

  logger.info("=== xlsx store 10");
  await store({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|=Foo",
      options: {
        logger: logger
      }
    },
    construct: {
      Foo: 'ten',
      Bar: 'Hamilton',
      Baz: 10,
      enabled: false
    }
  });

}

tests();