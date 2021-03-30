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
  if (uid === 1) return;

  logger.info("=== elasticsearch recall uid");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|" + uid
    }
  })) return 1;

  logger.info("=== elasticsearch recall !");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!",
      pattern: {
        key: uid
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
        Foo: uid
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
