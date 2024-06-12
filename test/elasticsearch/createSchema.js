/**
 * test/elasticsearch/createSchema
 */
"use strict";

const createSchema = require('../_createSchema');
const dull = require('../_dull');
const { logger } = require('@dictadata/lib');
const fs = require('node:fs');
const homedir = process.env[ "HOMEPATH" ] || require('os').homedir();

logger.info("===== elasticsearch createSchema ");

async function test(schema, encoding) {

  logger.info("=== createSchema " + schema);
  let retCode = await createSchema({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*",
      options: {
        encoding: "./test/data/input/engrams/" + encoding + ".engram.json",
        refresh: true
      }
    }
  });
  if (retCode > 0) return 1;

  if (retCode < 0) {
    // if schema already exists then truncate constructs
    logger.info("=== dull (truncate) " + schema);
    if (await dull({
      origin: {
        smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*"
      }
    })) return 1;
  }
}

async function test_lg() {
  logger.info("=== elasticsearch test_lg large fields");

  logger.info("=== createSchema foo_schema_lg");
  let retCode = await createSchema({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|foo_schema_lg|*",
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

(async () => {
  if (await test("foo_schema", "foo_schema")) return;
  if (await test("foo_schema_x", "foo_schema")) return;    // for dullSchema.js
  if (await test("foo_schema_01", "foo_schema_01")) return;
  if (await test("foo_widgets", "foo_widgets")) return;
  if (await test("foo_schema_two", "foo_schema_two")) return;

  if (await test_lg()) return;
})();
