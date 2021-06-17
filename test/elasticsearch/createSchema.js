/**
 * test/elasticsearch/createSchema
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const dull = require("../lib/_dull");
const { logger } = require('../../storage/utils');

logger.info("===== elasticsearch createSchema ");

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  if (await createSchema({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|*",
      options: {
        encoding: "./test/data/" + encoding + ".json"
      }
    }
  })) return 1;

  logger.info("=== dull (truncate) " + schema);
  if (await dull({
    origin: {
      smt: "elasticsearch|http://localhost:9200|" + schema + "|*"
    }
  })) return 1;

}

async function test_lg() {

  logger.info("=== elasticsearch large fields");
  if (await createSchema({
    origin: {
      smt: "elasticsearch|http://localhost:9200|foo_schema_lg|*",
      options: {
        encoding: "./test/data/encoding_foo_lg.json",
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
