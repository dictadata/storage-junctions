/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: ElasticSearch Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  await codify({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo"
    },
    outputFile1: './test/output/elasticsearch_encoding_1.json',
    outputFile2: './test/output/elasticsearch_encoding_2.json'
  });

}

tests();
