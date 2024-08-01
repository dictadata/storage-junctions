/**
 * test/elasticsearch/dullSchema
 */
"use strict";

const dullSchema = require('../_lib/_dullSchema');
const { logger } = require('@dictadata/lib');

logger.info("===== elasticsearch dullSchema ");

async function test(schema) {

  logger.info("=== dullSchema" + schema);
  if (await dullSchema({
    smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*"
  })) return 1;

}

(async () => {
  if (await test("foo_schema_x")) return;
  if (await test("timeseries")) return;
})();
