/**
 * test/fs/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const { logger } = require('../../storage/utils');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs/gzip_output.csv.gz');
  if (await dullSchema({ smt: "csv|./test/data/output/fs/|gzip_output.csv.gz|*" })) return 1;

}

(async () => {
  if (await tests()) return;
})();
