/**
 * test/elasticsearch
 */
"use strict";

const dull = require('../lib/_dull');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: elasticsearch");

async function keystore() {

  logger.info("=== elasticsearch dull !Foo");
  if (await dull({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo",
      pattern: {
        key: 'one'
      }
    }
  })) return 1;

}

async function primarykey() {

  logger.info("=== elasticsearch dull =Foo");
  if (await dull({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await keystore()) return 1;
  if (await primarykey()) return 1;
})();
