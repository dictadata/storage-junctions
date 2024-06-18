/**
 * test/mysql/getEngram
 */
"use strict";

const getEngram = require('../_lib/_getEngram');
const { logger } = require('@dictadata/lib');

logger.info("===== mysql getEngram ");

async function test(schema, encoding) {

  logger.info("=== getEngram " + schema);
  if (await getEngram({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|" + schema + "|*"
    },
    terminal: {
      output: "./test/_data/output/mysql/" + encoding + ".engram.json"
    }
  })) return 1;

}

(async () => {
  if (await test("foo_schema", "foo_schema")) return 1;
  if (await test("foo_schema_01", "foo_schema_01")) return 1;
  if (await test("foo_widgets", "foo_widgets")) return 1;
  if (await test("foo_schema_lg", "foo_schema_lg")) return 1;
  if (await test("foo_schema_two", "foo_schema_two")) return 1;
})();
