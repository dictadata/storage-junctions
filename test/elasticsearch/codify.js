/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: ElasticSearch Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  if (await codify({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo"
    },
    output: './data/output/elasticsearch/codify_00.json'
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_01|!Foo"
    },
    output: './data/output/elasticsearch/codify_01.json'
  })) return 1;

  logger.info("=== codify foo_schema_02");
  if (await codify({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_02|!Foo"
    },
    output: './data/output/elasticsearch/codify_02.json'
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
