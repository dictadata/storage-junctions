/**
 * test/memory
 */
"use strict";

const store = require('../lib/_store');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: memory");

async function tests() {

  logger.info("=== memory store");
  if (await store({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo"
    },
    construct: {
      "Foo": "second",
      "Bar": "row",
      "Baz": 456,
      "Fobe": 2.1,
      "Dt Test": "10/07/2018",
      "enabled": false
    }
  })) return 1;

  logger.info("=== memory store");
  if (await store({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo"
    },
    construct: {
      Foo: 'one',
      Bar: 'Washington',
      Baz: 1,
      Fobe: 1.1,
      "Dt Test": "10/07/2018",
      enabled: false
    }
  })) return 1;

  logger.info("=== memory store");
  if (await store({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20,
      Fobe: 20.20,
      "Dt Test": "2020-10-07T08:00:00",
      enabled: true
    }
  })) return 1;

  logger.info("=== memory store");
  if (await store({
    origin: {
      smt: "memory|testgroup|foo_schema|=Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20,
      Fobe: 20.20,
      "Dt Test": "2020-10-07 08:00:00",
      enabled: true
    }
  })) return 1;

  logger.info("=== memory store");
  if (await store({
    origin: {
      smt: "memory|testgroup|foo_schema|=Foo"
    },
    construct: {
      Foo: 'ten',
      Bar: 'Hamilton',
      Baz: 10,
      Fobe: 0.10,
      "Dt Test": "2020-10-07",
      enabled: true
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
