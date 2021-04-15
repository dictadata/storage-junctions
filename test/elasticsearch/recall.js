/**
 * test/elasticsearch
 */
"use strict";

const recall = require('../lib/_recall');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: elasticsearch");

async function keystore() {

  logger.info("=== elasticsearch recall");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo",
      pattern: {
        key: 'twenty'
      }
    },
    terminal: {
      output: "./data/output/elasticsearch/recall_1.json"
    }
  })) return 1;

}

async function primarykey() {

  logger.info("=== elasticsearch recall");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./data/output/elasticsearch/recall_2.json"
    }
  })) return 1;

}

(async () => {
  if (await keystore()) return 1;
  if (await primarykey()) return 1;
})();
