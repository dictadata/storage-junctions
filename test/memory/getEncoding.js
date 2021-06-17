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
      output: "./test/data/output/memory/" + encoding + ".json"
    }
  })) return 1;
  
}

exports.runTests = async () => {
  if (await test("foo_schema", "encoding_foo")) return 1;
  if (await test("foo_schema_01", "encoding_foo_01")) return 1;
  if (await test("foo_schema_02", "encoding_foo_02")) return 1;
  if (await test("foo_schema_lg", "encoding_foo_lg")) return 1;
  if (await test("foo_schema_two", "encoding_foo_two")) return 1;
};
