/**
 * test/elasticsearch
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch dull !Foo");
  await dull({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo",
      pattern: {
        key: 'twenty'
      }
    }
  });

  logger.info("=== elasticsearch dull =Foo");
  await dull({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  });

}

(async () => {
  await tests();
})();
