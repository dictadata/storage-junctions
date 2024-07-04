/**
 * test/elasticsearch
 */
"use strict";

const recall = require('../_lib/_recall');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: elasticsearch");

async function keystore() {

  logger.info("=== elasticsearch recall");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo",
      pattern: {
        key: 'twenty'
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/recall_nk.json"
    }
  })) return 1;

  logger.info("=== elasticsearch recall ks");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!",
      pattern: {
        key: 'twenty'
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/recall_ks.json"
    }
  })) return 1;

}

async function primarykey() {

  logger.info("=== elasticsearch recall");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./test/_data/output/elasticsearch/recall_pk.json"
    }
  })) return 1;

}

(async () => {
  if (await keystore()) return 1;
  if (await primarykey()) return 1;
})();
