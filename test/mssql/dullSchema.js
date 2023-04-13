/**
 * test/mssql/dullSchema
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("===== mssql dullSchema ");

async function test(schema, encoding) {

  logger.info("=== dullSchema" + schema);
  if (await dullSchema({
    smt: "mssql|server=dev.dictadata.net;database=storage_node|" + schema + "|*"
  })) return 1;

}

(async () => {
  if (await test("foo_schema_x", "foo_schema")) return;
})();
