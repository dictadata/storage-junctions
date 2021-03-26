/**
 * test/elasticsearch
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const logger = require('../../storage/logger');

logger.info("===== elasticsearch createSchema ");

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  await createSchema({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|!Foo",
      options: {
        encoding: "./test/data/" + encoding + ".json"
      }
    }
  });

}

(async () => {
  await test("foo_schema", "encoding_foo");
  await test("foo_schema_01", "encoding_foo_01");
  await test("foo_schema_02", "encoding_foo_02");
  await test("foo_schema_x", "encoding_foo");    // for dullSchema.js
})();
