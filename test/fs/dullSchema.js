/**
 * test/fs/transfers
 */
"use strict";

const transfer = require('../lib/_transfer');
const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Test: gzip transfers");

async function tests() {

  logger.verbose('=== csv => fs/gzip_output.csv.gz');
  await dullSchema({ smt: "csv|./output/fs/|gzip_output.csv.gz|*" });
  
}

(async () => {
  await tests();
})();
