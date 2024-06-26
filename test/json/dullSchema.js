/**
 * test/json
 */
"use strict";

const dullSchema = require('../_lib/_dullSchema');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: json dullSchema");

async function tests() {

  logger.verbose('=== json transform_1.json');
  await dullSchema({ smt: "json|./test/_data/output/json/|transform_1.json|*" });

  logger.verbose('=== json transform_2.json');
  await dullSchema({ smt: "json|./test/_data/output/json/|transform_2.json|*" });

  logger.verbose('=== json transform_3.csv');
  await dullSchema({ smt: "csv|./test/_data/output/json/|transform_3.csv|*" });

}

(async () => {
  await tests();
})();
