/**
 * test/mssql/createSchema
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const dull = require("../lib/_dull");
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql createSchema");

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  if (await createSchema({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|" + schema + "|*",
      options: {
        encoding: "./data/input/" + encoding + ".encoding.json"
      }
    }
  })) return 1;

  logger.info("=== dull (truncate) " + schema);
  if (await dull({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|" + schema + "|*"
    }
  })) return 1;

}

async function test_lg() {

  logger.info("=== mssql large fields");
  if (await createSchema({
    origin: {
      smt: "mssql|server=localhost;username=dicta;password=data;database=storage_node|foo_schema_lg|*",
      options: {
        encoding: "./data/input/foo_schema_lg.encoding.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await test("foo_schema", "foo_schema")) return 1;
  if (await test("foo_schema_x", "foo_schema")) return 1;    // for dullSchema.js
  if (await test("foo_schema_01", "foo_schema_01")) return 1;
  if (await test("foo_schema_02", "foo_schema_02")) return 1;
  if (await test("foo_schema_two", "foo_schema_two")) return 1;
  if (await test_lg()) return 1;
})();
