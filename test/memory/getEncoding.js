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
  if (await test("foo_schema", "foo_schema-encoding")) return 1;
  if (await test("foo_schema_01", "foo_schema_01-encoding")) return 1;
  if (await test("foo_schema_02", "foo_schema_02-encoding")) return 1;
  if (await test("foo_schema_lg", "foo_schema_lg-encoding")) return 1;
  if (await test("foo_schema_two", "foo_schema_two-encoding")) return 1;
};
