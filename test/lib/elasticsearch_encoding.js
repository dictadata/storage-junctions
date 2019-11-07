/**
 * test/elasticsearch
 */
"use strict";

const getEncoding = require('./_getEncoding');
const putEncoding = require('./_putEncoding');
const logger = require('../../lib/logger');

logger.info("===== elasticsearch encoding ");

async function tests() {

  logger.info("=== putEncoding test_schema");
  await putEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!Foo"
    }
  });

  logger.info("=== getEncoding test_schema");
  await getEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*"
    },
    OutputFile: './test/output/elasticsearch_foo_encoding.json'
  });

}

tests();
