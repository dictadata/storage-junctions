/**
 * test/memory/getEncoding
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const { logger } = require('../../storage/utils');

async function test(schema, encoding) {

  logger.info("=== getEncoding " + schema);
  if (await getEncoding({
    origin: {
      smt: "memory|testgroup|" + schema + "|*"
    },
    terminal: {
      output: "./data/output/memory/" + encoding + ".encoding.json"
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await test("foo_schema", "foo_schema")) return 1;
  if (await test("foo_schema_01", "foo_schema_01")) return 1;
  if (await test("foo_schema_02", "foo_schema_02")) return 1;
  if (await test("foo_schema_lg", "foo_schema_lg")) return 1;
  if (await test("foo_schema_two", "foo_schema_two")) return 1;
};
