/**
 * test/json
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: json transforms");

async function tests() {

  logger.verbose('=== json_transform_1.json');
  let smt1 = "json|./data/output/json/|transform_1.json|*";
  await dullSchema({ smt: smt1 })

  logger.verbose('=== json_transform_2.json');
  let smt2 = "json|./data/output/json/|transform_2.json|*";
  await dullSchema({ smt: smt2 })

  logger.verbose('=== json > json_transform_3.csv');
  let smt3 = "csv|./data/output/json/|transform_3.csv|*";
  await dullSchema({ smt: smt3 })

}

(async () => {
  await tests();
})();
