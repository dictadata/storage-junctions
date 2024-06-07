/**
 * test/memory/dullSchema
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('@dictadata/storage-lib');

async function test(schema, encoding) {

  logger.info("=== dullSchema" + schema);
  if (await dullSchema({
    smt: "memory|testgroup|" + schema + "|*"
  })) return 1;

}

exports.runTests = async () => {
  if (await test("foo_schema_x", "foo_schema")) return 1;

  return 0;
};
