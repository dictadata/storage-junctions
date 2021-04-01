/**
 * test/json
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: csv transforms");

async function tests() {

  logger.verbose('=== csv > csv_transform_1.json');
  let smt1 = "json|./data/output/csv/|transform_1.json|*";
  if (await dullSchema({ smt: smt1 })) return 1;

  logger.verbose('=== csv > csv_transform_2.json');
  let smt2 = "json|./data/output/csv/|transform_2.json|*";
  if (await dullSchema({ smt: smt2 })) return 1;

  logger.verbose('=== csv > csv_transform_3.json');
  let smt3 = "json|./data/output/csv/|transform_3.json|*";
  if (await dullSchema({ smt: smt3 })) return 1;
}

(async () => {
  if (await tests()) return;
})();
