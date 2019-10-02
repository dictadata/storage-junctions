/**
 * test/json
 */
"use strict";

const transfer = require('./_transfer');
const logger = require('../../lib/logger');

logger.info("=== Test: json");

async function tests() {
  logger.verbose('./test/data/testfile.json');

  await transfer({
    source: { 
      smt: "json|./test/data/|testfile.json|*" 
    },
    destination: { 
      smt: "json|./test/output/|json_output.json|*" 
    }
  });

  logger.verbose('./test/output/json_output.json');
}

tests();
