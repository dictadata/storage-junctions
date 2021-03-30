/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../storage/logger');

logger.info("=== tests: ElasticSearch Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  await codify({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo"
    },
    outputFile1: './data/output/elasticsearch/codify_01.json',
    outputFile2: './data/output/elasticsearch/codify_02.json'
  });

  logger.info("=== codify foo_schema_01");
  await codify({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_01|!Foo"
    },
    outputFile1: './data/output/elasticsearch/codify_11.json',
    outputFile2: './data/output/elasticsearch/codify_12.json'
  });

  logger.info("=== codify foo_schema_02");
  await codify({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_02|!Foo"
    },
    outputFile1: './data/output/elasticsearch/codify_21.json',
    outputFile2: './data/output/elasticsearch/codify_22.json'
  });

}

(async () => {
  await tests();
})();
