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
  await test("foo_schema_x", "encoding_foo");
})();
