/**
 * test/mysql/dullSchema
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('@dictadata/storage-lib');

logger.info("===== mysql dullSchema ");

async function test(schema) {

  logger.info("=== dullSchema" + schema);
  if (await dullSchema({
    smt: "mysql|host=dev.dictadata.net;database=storage_node|" + schema + "|*"
  })) return 1;

}

(async () => {
  if (await test("foo_schema_x")) return;
  if (await test("timeseries")) return;
})();
