/**
 * test/codify
 */
"use strict";

const codify = require('../_lib/_codify');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: ElasticSearch Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  if (await codify({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema|!Foo"
    },
    terminal: {
      output: './test/_data/output/elasticsearch/codify_00.engram.json'
    }
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_01|!Foo"
    },
    terminal: {
      output: './test/_data/output/elasticsearch/codify_01.engram.json'
    }
  })) return 1;

  logger.info("=== codify foo_widgets");
  if (await codify({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_widgets|!Foo"
    },
    terminal: {
      output: './test/_data/output/elasticsearch/codify_02.engram.json'
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
