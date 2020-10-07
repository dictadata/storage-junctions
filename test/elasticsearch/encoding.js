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
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|!Foo"
    }
  });

  logger.info("=== getEncoding foo_schema");
  await getEncoding({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema|*"
    },
    terminal: {
      output: './test/output/elasticsearch_foo_encoding.json'
    }
  });

  /*
    logger.info("=== putEncoding foo_schema_doc");
    await putEncoding({
      origin: {
        smt: "elasticsearch|http://localhost:9200|foo_schema_doc|!Foo",
        filename: 'foo2_encoding.json'
      }
    });
  
    logger.info("=== getEncoding foo_schema_doc");
    await getEncoding({
      origin: {
        smt: "elasticsearch|http://localhost:9200|foo_schema_doc|*"
      },
      terminal: {
        output: './test/output/elasticsearch_foo_encoding_doc.json'
      }
    });
  */
}

tests();
