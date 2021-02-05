/**
 * test/oracle
 */
"use strict";

const store = require('../lib/_store');
const logger = require('../../lib/logger');

logger.info("=== Test: oracle");

async function tests() {

  logger.info("=== oracle store 20");
  await store({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== oracle store 30");
  await store({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 30,
      enabled: false
    }
  });

  logger.info("=== oracle store 10");
  await store({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo",
    },
    construct: {
      Foo: 'ten',
      Bar: 'Hamilton',
      Baz: 10,
      enabled: false
    }
  });

}

(async () => {
  await tests();
})();
