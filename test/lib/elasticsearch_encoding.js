/**
 * test/elasticsearch
 */
"use strict";

const getEncoding = require('./_getEncoding');
const putEncoding = require('./_putEncoding');
const logger = require('../../lib/logger');

logger.info("===== elasticsearch encoding ");

async function tests() {

  logger.info("=== elasticsearch putEncoding");
  await putEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|!Foo"
    }
  });

  logger.info("=== elasticsearch getEncoding");
  await getEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|test_schema|*"
    },
    OutputFile: './test/output/elasticsearch_foo_encoding.json'
  });

}

tests();
