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
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|" + schema + "|*"
    },
    terminal: {
      output: "./data/output/mssql/" + encoding + ".json"
    }
  })) return 1;
  
}

(async () => {
  if (await test("foo_schema", "encoding_foo")) return;
  if (await test("foo_schema_01", "encoding_foo_01")) return;
  if (await test("foo_schema_02", "encoding_foo_02")) return;
  if (await test("foo_schema_lg", "encoding_foo_lg")) return;
  if (await test("foo_schema_two", "encoding_foo_two")) return;
})();
