/**
 * test/elasticsearch
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const putEncoding = require('../lib/_putEncoding');
const logger = require('../../lib/logger');

logger.info("===== elasticsearch encoding ");

async function test(schema, encoding) {

  logger.info("=== putEncoding " + schema);
  await putEncoding({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|!Foo",
      encoding: "./test/data/" + encoding + ".json"
    }
  });

  logger.info("=== getEncoding " + schema);
  await getEncoding({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|*"
    },
    terminal: {
      output: "./output/elasticsearch_" + encoding + ".json"
    }
  });
}

(async () => {
  await test("foo_schema", "encoding_foo");
  await test("foo_schema_01", "encoding_foo_01");
  await test("foo_schema_02", "encoding_foo_02");
})();
