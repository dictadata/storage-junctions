/**
 * test/elasticsearch
 */
"use strict";

const store = require('../lib/_store');
const recall = require('../lib/_recall');
const dull = require('../lib/_dull');
const logger = require('../../storage/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {
  let keyValues = {};

  logger.info("=== elasticsearch store");
  if (await store({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo"
    },
    construct: {
      Foo: 'twenty',
      Bar: 'Jackson',
      Baz: 20
    }
  }, keyValues)) return 1;

  logger.info("=== elasticsearch recall uid");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|" + keyValues.uid
    }
  })) return 1;

  logger.info("=== elasticsearch recall !");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!",
      pattern: {
        key: keyValues.uid
      }
    }
  })) return 1;

  logger.info("=== elasticsearch recall !Foo");
  if (await recall({
    origin: {
      smt: {
        model: "elasticsearch",
        locus: "http://localhost:9200",
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
