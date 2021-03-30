/**
 * test/elasticsearch
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../storage/logger');

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
      output: "./data/output/elasticsearch/recall_1.json"
    }
  });

  logger.info("=== elasticsearch recall");
  await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    },
    terminal: {
      output: "./data/output/elasticsearch/recall_2.json"
    }
  });

}

(async () => {
  await tests();
})();
