/**
 * test/codify
 */
"use strict";

const codify = require('./_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: Codify");

async function tests() {
  await codify({
    src_smt: "csv|./test/data/|testfile.csv|*"
  });
}

tests();
