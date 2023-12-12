/**
 * test/csv
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: csv dullSchema");

async function tests() {

  logger.verbose('=== csv transform_1.csv');
  if (await dullSchema({ smt: "csv|./test/data/output/csv/|transform_1.csv|*" })) return 1;

  logger.verbose('=== csv transform_2.csv');
  if (await dullSchema({ smt: "csv|./test/data/output/csv/|transform_2.csv|*" })) return 1;

  logger.verbose('=== csv transform_3.csv');
  if (await dullSchema({ smt: "csv|./test/data/output/csv/|transform_3.csv|*" })) return 1;
}

(async () => {
  if (await tests()) return;
})();
