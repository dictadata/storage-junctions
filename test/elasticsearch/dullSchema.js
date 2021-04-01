/**
 * test/elasticsearch
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("===== elasticsearch getEncoding ");

async function test(schema, encoding) {

  logger.info("=== dullSchema" + schema);
  if (await dullSchema({
    smt: "elasticsearch|http://localhost:9200|" + schema + "|*"
  })) return 1;

}

(async () => {
  if (await test("foo_schema_x", "encoding_foo")) return;
})();
