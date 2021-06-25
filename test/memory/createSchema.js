/**
 * test/memory/createSchema
 */
"use strict";

const _createSchema = require('../lib/_createSchema');
const { logger } = require('../../storage/utils');

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  if (await _createSchema({
    origin: {
      smt: "memory|testgroup|" + schema + "|*",
      options: {
        encoding: "./test/data/input/" + encoding + ".json"
      }
    }
  })) return 1;

}

async function test_lg() {

  logger.info("=== memory large fields");
  if (await _createSchema({
    origin: {
      smt: "memory|testgroup|foo_schema_lg|*",
      options: {
        encoding: "./test/data/input/encoding_foo_lg.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await test("foo_schema", "encoding_foo")) return 1;
  if (await test("foo_schema_x", "encoding_foo")) return 1;    // for dullSchema.js
  if (await test("foo_schema_01", "encoding_foo_01")) return 1;
  if (await test("foo_schema_02", "encoding_foo_02")) return 1;
  if (await test("foo_schema_two", "encoding_foo_two")) return 1;
  if (await test_lg()) return 1;

  return 0;
};
