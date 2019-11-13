/**
 * test/elasticsearch
 */
"use strict";

const dull = require('../_dull');
const logger = require('../../../lib/logger');

logger.info("=== Tests: elasticsearch");

async function tests() {

  logger.info("=== elasticsearch dull");
  await dull({
    source: {
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
