/**
 * test/mssql/getEncoding
 */
"use strict";

const getEncoding = require('../lib/_getEncoding');
const { logger } = require('../../storage/utils');

logger.info("===== mssql getEncoding ");

async function test(schema, encoding) {

  logger.info("=== getEncoding " + schema);
  if (await getEncoding({
    origin: {
      smt: "mssql|server=dev.dictadata.net;database=storage_node|" + schema + "|*"
    },
    terminal: {
      output: "./test/data/output/mssql/" + encoding + ".encoding.json"
    }
  })) return 1;

}

(async () => {
  if (await test("foo_schema", "foo_schema")) return 1;
  if (await test("foo_schema_01", "foo_schema_01")) return 1;
  if (await test("foo_schema_02", "foo_schema_02")) return 1;
  if (await test("foo_schema_lg", "foo_schema_lg")) return 1;
  if (await test("foo_schema_two", "foo_schema_two")) return 1;
})();
