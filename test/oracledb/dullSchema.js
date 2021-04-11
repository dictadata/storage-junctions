/**
 * test/oracledb/dullSchema
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("===== oracledb dullSchema ");

async function test(schema, encoding) {

  logger.info("=== dullSchema" + schema);
  if (await dullSchema({
    smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|" + schema + "|*"
  })) return 1;

}

(async () => {
  if (await test("foo_schema_x", "encoding_foo")) return;
})();
