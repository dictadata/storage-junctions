/**
 * test/elasticsearch
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const createSchema = require('../lib/_createSchema');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("===== elasticsearch getEncoding ");

async function test(schema, encoding) {

  logger.info("=== getEncoding " + schema);
  await getEncoding({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|*"
    },
    terminal: {
      output: "./data/output/elasticsearch/" + encoding + ".json"
    }
  });
  
}

(async () => {
  await test("foo_schema", "encoding_foo");
  await test("foo_schema_01", "encoding_foo_01");
  await test("foo_schema_02", "encoding_foo_02");
})();
