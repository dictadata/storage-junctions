/**
 * test/elasticsearch
 */
"use strict";

const store = require('./_store');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch store");
  await store({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== elasticsearch store");
  await store({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== elasticsearch store");
  await store({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo"
    },
    construct: {
      Foo: 'ten',
      Bar: 'Hamilton',
      Baz: 10
    }
  });

}

tests();
