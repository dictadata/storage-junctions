/**
 * test/memory/dullSchema
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("===== memory dullSchema ");

async function test(schema, encoding) {

  logger.info("=== dullSchema" + schema);
  if (await dullSchema({
    smt: "memory|testgroup|" + schema + "|*"
  })) return 1;

}

(async () => {
  if (await test("foo_schema_x", "encoding_foo")) return;
})();
