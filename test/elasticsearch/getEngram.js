/**
 * test/elasticsearch/getEngram
 */
"use strict";

const getEngram = require('../lib/_getEngram');
const { logger } = require('../../storage/utils');

logger.info("===== elasticsearch getEngram ");

async function test(schema, encoding) {

  logger.info("=== getEngram " + schema);
  if (await getEngram({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*"
    },
    terminal: {
      output: "./test/data/output/elasticsearch/" + encoding + ".engram.json"
    }
  })) return 1;

}

(async () => {
  if (await test("foo_schema", "foo_schema")) return;
  if (await test("foo_schema_01", "foo_schema_01")) return;
  if (await test("foo_widgets", "foo_widgets")) return;
  if (await test("foo_schema_lg", "foo_schema_lg")) return;
  if (await test("foo_schema_two", "foo_schema_two")) return;
})();
