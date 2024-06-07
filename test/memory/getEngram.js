/**
 * test/memory/getEngram
 */
"use strict";

const getEngram = require('../lib/_getEngram');
const { logger } = require('@dictadata/storage-lib');

async function test(schema, encoding) {

  logger.info("=== getEngram " + schema);
  if (await getEngram({
    origin: {
      smt: "memory|testgroup|" + schema + "|*"
    },
    terminal: {
      output: "./test/data/output/memory/" + encoding + ".engram.json"
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await test("foo_schema", "foo_schema")) return 1;
  if (await test("foo_schema_01", "foo_schema_01")) return 1;
  if (await test("foo_widgets", "foo_widgets")) return 1;
  if (await test("foo_schema_lg", "foo_schema_lg")) return 1;
  if (await test("foo_schema_two", "foo_schema_two")) return 1;
};
