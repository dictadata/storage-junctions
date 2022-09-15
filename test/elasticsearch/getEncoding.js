/**
 * test/elasticsearch/getEncoding
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const { logger } = require('../../storage/utils');

logger.info("===== elasticsearch getEncoding ");

async function test(schema, encoding) {

  logger.info("=== getEncoding " + schema);
  if (await getEncoding({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.org:9200|" + schema + "|*"
    },
    terminal: {
      output: "./data/output/elasticsearch/" + encoding + ".encoding.json"
    }
  })) return 1;

}

(async () => {
  if (await test("foo_schema", "foo_schema")) return;
  if (await test("foo_schema_01", "foo_schema_01")) return;
  if (await test("foo_schema_02", "foo_schema_02")) return;
  if (await test("foo_schema_lg", "foo_schema_lg")) return;
  if (await test("foo_schema_two", "foo_schema_two")) return;
})();
