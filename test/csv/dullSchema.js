/**
 * test/json
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: csv transforms");

async function tests() {

  logger.verbose('=== csv > csv_transform_1.json');
  let smt1 = "json|./output/csv/|transform_1.json|*";
  await dullSchema({ smt: smt1 })

  logger.verbose('=== csv > csv_transform_2.json');
  let smt2 = "json|./output/csv/|transform_2.json|*";
  await dullSchema({ smt: smt2 })

  logger.verbose('=== csv > csv_transform_3.json');
  let smt3 = "json|./output/csv/|transform_3.json|*";
  await dullSchema({ smt: smt3 })

(async () => {
  await tests();
})();
