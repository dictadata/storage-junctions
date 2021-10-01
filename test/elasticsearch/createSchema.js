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
        encoding: "./test/data/input/" + encoding + ".encoding.json"
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
        encoding: "./test/data/input/foo_schema_lg.encoding.json",
        stringBreakpoints: {
          keyword: 120,
          text: 2000
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await test("foo_schema", "foo_schema")) return;
  if (await test("foo_schema_x", "foo_schema")) return;    // for dullSchema.js
  if (await test("foo_schema_01", "foo_schema_01")) return;
  if (await test("foo_schema_02", "foo_schema_02")) return;
  if (await test("foo_schema_two", "foo_schema_two")) return;
  if (await test_lg()) return;
})();
