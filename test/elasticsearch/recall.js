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
      output: "./test/data/output/elasticsearch/recall_1.json"
    }
  })) return 1;

  logger.info("=== elasticsearch recall ks");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!",
      pattern: {
        key: 'twenty'
      }
    },
    terminal: {
      output: "./test/data/output/elasticsearch/recall_ks.json"
    }
  })) return 1;

}

async function primarykey() {

  logger.info("=== elasticsearch recall");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_pk|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./test/data/output/elasticsearch/recall_pk.json"
    }
  })) return 1;

}

(async () => {
  if (await keystore()) return 1;
  if (await primarykey()) return 1;
})();
