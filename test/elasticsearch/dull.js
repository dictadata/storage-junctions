/**
 * test/elasticsearch
 */
"use strict";

const dull = require('../lib/_dull');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch dull !Foo");
  if (await dull({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo",
      pattern: {
        key: 'twenty'
      }
    }
  })) return 1;

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
  if (await tests()) return;
})();
