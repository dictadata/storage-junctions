/**
 * test/shapefile
 */
"use strict";

const transfer = require('../lib/_transfer');
const { logger } = require("@dictadata/lib");

logger.info("=== shapefile transfer badfile");


async function tests() {

  logger.verbose("=== Transfer polygons_badfile");
  if (await transfer({
    origin: {
      smt: "shp|./test/data/input/shapes/|polygons_badfile|*"
    },
    terminal: {
      smt: "json|./test/data/output/shapefile/|polygons_badfile.json|*",
      output: "./test/data/output/shapefile/polygons_badfile.json"
    }
  }, -1))
    return 1;

}

(async () => {
  logger.verbose("... begin tests ...");
  let rc = await tests();
  if (rc) return 1;
  logger.verbose("... end of tests ...");
})();
