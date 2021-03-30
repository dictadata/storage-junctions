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
  if (await getEncoding({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|*"
    },
    terminal: {
      output: "./data/output/elasticsearch/" + encoding + ".json"
    }
  })) return 1;
  
}

(async () => {
  if (await test("foo_schema", "encoding_foo")) return;
  if (await test("foo_schema_01", "encoding_foo_01")) return;
  if (await test("foo_schema_02", "encoding_foo_02")) return;
})();
