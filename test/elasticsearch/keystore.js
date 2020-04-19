/**
 * test/elasticsearch
 */
"use strict";

const store = require('../lib/_store');
const recall = require('../lib/_recall');
const dull = require('../lib/_dull');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch store");
  let uid = await store({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  });

  logger.info("=== elasticsearch recall uid");
  await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|" + uid
    }
  });

  logger.info("=== elasticsearch recall !");
  await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!",
      pattern: {
        key: uid
      }
    }
  });

  logger.info("=== elasticsearch recall !Foo");
  await recall({
    origin: {
      smt: {
        model: "elasticsearch",
        locus: "http://localhost:9200",
        schema: "foo_schema",
        key: "!Foo"
      },
      pattern: {
        Foo: uid
      }
    }
  });

}

tests();
