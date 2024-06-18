/**
 * test/mysql
 */
"use strict";

const createSchema = require('../_lib/_createSchema');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: shapefile schema");

async function test(schema) {

  logger.info("=== shapefile createSchema bl_congress_schema");
  let retCode = await createSchema({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|" + schema + "|*",
      options: {
        encoding: "./test/_data/input/engrams/" + schema + ".engram.json"
      }
    }
  });
  if (retCode > 0) return 1;

}

(async () => {
  if (await test("bl_2020_ia_congress")) return 1;
})();
