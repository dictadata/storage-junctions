/**
 * test/elasticsearch
 */
"use strict";

const dull = require('../_dull');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: elasticsearch");

async function keystore() {

  logger.info("=== elasticsearch dull !Foo");
  if (await dull({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo",
      pattern: {
        key: 'one'
      }
    },
    terminal: {
      output: "./test/data/output/elasticsearch/dull_ks.json"
    }
  })) return 1;

}

async function primarykey() {

  logger.info("=== elasticsearch dull =Foo");
  if (await dull({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    },
    terminal: {
      output: "./test/data/output/elasticsearch/dull_pk.json"
    }
  })) return 1;

}

(async () => {
  if (await keystore()) return 1;
  if (await primarykey()) return 1;
})();
