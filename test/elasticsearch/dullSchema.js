/**
 * test/elasticsearch
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("===== elasticsearch getEncoding ");

async function test(schema, encoding) {

  logger.info("=== dullSchema" + schema);
  await dullSchema({
    smt: "elasticsearch|http://localhost:9200|" + schema + "|*"
  });

}

(async () => {
  //await test("foo_schema", "encoding_foo");
  //await test("foo_schema_01", "encoding_foo_01");
  //await test("foo_schema_02", "encoding_foo_02");
  await test("foo_schema_x", "encoding_foo");
})();
