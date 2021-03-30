/**
 * test/transport
 */
"use strict";

const store = require('../lib/_store');
const logger = require('../../storage/logger');

logger.info("=== Test: transport");

async function tests() {

  logger.info("=== transport store 20");
  if (await store({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  })) return 1;

  logger.info("=== transport store 30");
  if (await store({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|=Foo",
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 30,
      enabled: false
    }
  })) return 1;

  logger.info("=== transport store 10");
  if (await store({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|=Foo",
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
