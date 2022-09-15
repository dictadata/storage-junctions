/**
 * test/elasticsearch/dullSchema
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("===== elasticsearch dullSchema ");

async function test(schema, encoding) {

  logger.info("=== dullSchema" + schema);
  if (await dullSchema({
    smt: "elasticsearch|http://dev.dictadata.org:9200|" + schema + "|*"
  })) return 1;

}

(async () => {
  if (await test("foo_schema_x", "foo_schema")) return;
})();
