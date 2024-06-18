/**
 * test/elasticsearch
 */
"use strict";

const store = require('../_lib/_store');
const recall = require('../_lib/_recall');
const dull = require('../_lib/_dull');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: elasticsearch");

async function tests() {
  let keyValues = {};

  logger.info("=== elasticsearch store");
  if (await store({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!"
    },
    construct: {
      Foo: '50',
      Bar: 'Grant',
      Baz: 50,
      "Dt Test": "2018-10-18"
    }
  }, 2, keyValues)) return 1;

  logger.info("=== elasticsearch recall uid");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|" + keyValues.uid
    }
  })) return 1;

  logger.info("=== elasticsearch recall !");
  if (await recall({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!",
      pattern: {
        key: keyValues.uid
      }
    }
  })) return 1;

  logger.info("=== elasticsearch recall uid");
  if (await dull({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|" + keyValues.uid
    }
  })) return 1;

}

(async () => {
  if (await tests()) return 1;
})();
