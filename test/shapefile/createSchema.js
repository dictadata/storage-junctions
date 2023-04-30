/**
 * test/mysql
 */
"use strict";

const createSchema = require('../lib/_createSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: shapefile schema");

async function test(schema) {

  logger.info("=== shapefile createSchema bl_congress_schema");
  if (await createSchema({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*",
      options: {
        encoding: "./data/input/encodings/" + schema + ".encoding.json"
      }
    }
  })) return 1;

}

(async () => {
  if (await test("bl_2020_ia_congress")) return 1;
})();
