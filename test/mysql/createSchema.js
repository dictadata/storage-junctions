/**
 * test/mysql/createSchema
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const dull = require("../lib/_dull");
const { logger } = require('../../storage/utils');

logger.info("=== Test: mysql createSchema");

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  if (await createSchema({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|" + schema + "|*",
      options: {
        encoding: "./test/data/input/" + encoding + ".json"
      }
    }
  })) return 1;

  logger.info("=== dull (truncate) " + schema);
  if (await dull({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|" + schema + "|*"
    }
  })) return 1;

}

async function test_lg() {

  logger.info("=== mysql large fields");
  if (await createSchema({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_lg|*",
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

(async () => {
  if (await test("foo_schema", "encoding_foo")) return;
  if (await test("foo_schema_x", "encoding_foo")) return;    // for dullSchema.js
  if (await test("foo_schema_01", "encoding_foo_01")) return;
  if (await test("foo_schema_02", "encoding_foo_02")) return;
  if (await test("foo_schema_two", "encoding_foo_two")) return;
  if (await test_lg()) return;
})();
