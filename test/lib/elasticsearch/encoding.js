/**
 * test/elasticsearch
 */
"use strict";

const getEncoding = require('../_getEncoding');
const putEncoding = require('../_putEncoding');
const logger = require('../../../lib/logger');

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

}

tests();
