/**
 * test/elasticsearch
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("===== elasticsearch encoding ");

async function tests() {

  logger.info("=== putEncoding foo_schema");
  await putEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo"
    }
  });

  logger.info("=== getEncoding foo_schema");
  await getEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    },
    OutputFile: './test/output/elasticsearch_foo_encoding.json'
  });

  logger.info("=== putEncoding foo_schema_2");
  await putEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_2|!Foo",
      filename: 'foo2_encoding.json'
    }
  });

  logger.info("=== getEncoding foo_schema_2");
  await getEncoding({
    source: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_2|*"
    },
    OutputFile: './test/output/elasticsearch_foo_encoding_2.json'
  });

}

tests();
