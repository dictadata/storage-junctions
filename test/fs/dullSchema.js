/**
 * test/fs/transfers
 */
"use strict";

const transfer = require('../_lib/_transfer');
const dullSchema = require('../_lib/_dullSchema');
const { logger } = require('@dictadata/lib');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs/gzip_output.csv.gz');
  if (await dullSchema({ smt: "csv|./test/_data/output/fs/|gzip_output.csv.gz|*" })) return 1;

}

(async () => {
  if (await tests()) return;
})();
