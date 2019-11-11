/**
 * test/elasticsearch
 */
"use strict";

const recall = require('./_recall');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch recall =Foo");
  await recall({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo",
      pattern: {
        Foo: 'twenty'
      }
    }
  });

}

tests();
