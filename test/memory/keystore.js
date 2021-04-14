/**
 * test/memory
 */
"use strict";

const store = require('../lib/_store');
const recall = require('../lib/_recall');
const dull = require('../lib/_dull');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: memory");

async function tests() {
  let keyValues = {};

  logger.info("=== memory store");
  if (await store({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  }, keyValues)) return 1;

  logger.info("=== memory recall uid");
  if (await recall({
    origin: {
      smt: "memory|testgroup|foo_schema|" + keyValues.uid
    }
  })) return 1;

  logger.info("=== memory recall !");
  if (await recall({
    origin: {
      smt: "memory|testgroup|foo_schema|!",
      pattern: {
        key: keyValues.uid
      }
    }
  })) return 1;

  logger.info("=== memory recall !Foo");
  if (await recall({
    origin: {
      smt: {
        model: "memory",
        locus: ".",
        schema: "foo_schema",
        key: "!Foo"
      },
      pattern: {
        Foo: keyValues.uid
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
