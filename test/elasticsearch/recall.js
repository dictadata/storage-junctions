/**
 * test/elasticsearch
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch recall");
  await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo",
      pattern: {
        key: 'twenty'
      }
    },
    terminal: {
      output: "./test/output/elastic_recall.json"
    }
  });

  logger.info("=== elasticsearch recall");
  await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  });

}

tests();
