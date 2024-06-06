/**
 * test/memory/createSchema
 */
"use strict";

const _createSchema = require('../lib/_createSchema');
const { logger } = require("@dictadata/lib");

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  let retCode = await _createSchema({
    origin: {
      smt: "memory|testgroup|" + schema + "|*",
      options: {
        encoding: "./test/data/input/engrams/" + encoding + ".engram.json"
      }
    }
  });
  if (retCode > 0) return 1;

}

async function test_lg() {

  logger.info("=== memory large fields");
  let retCode = await _createSchema({
    origin: {
      smt: "memory|testgroup|foo_schema_lg|*",
      options: {
        encoding: "./test/data/input/engrams/foo_schema_lg.engram.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  });
  if (retCode > 0) return 1;

}

exports.runTests = async () => {
  if (await test("foo_schema", "foo_schema")) return 1;
  if (await test("foo_schema_x", "foo_schema")) return 1;    // for dullSchema.js
  if (await test("foo_schema_01", "foo_schema_01")) return 1;
  if (await test("foo_widgets", "foo_widgets")) return 1;
  if (await test("foo_schema_two", "foo_schema_two")) return 1;

  if (await test_lg()) return 1;

  return 0;
};
