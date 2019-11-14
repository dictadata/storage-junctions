/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: Codify");

async function tests() {

  logger.info("=== codify foofile.json");
  await codify({
    source: {
      smt: "json|./test/data/|foofile.json|*"
    },
    outputFile1: './test/output/json_encoding_1.json',
    outputFile2: './test/output/json_encoding_2.json'
  });

  logger.info("=== codify foofile.json.gz");
  await codify({
    source: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    outputFile1: './test/output/json_encoding_g1.json',
    outputFile2: './test/output/json_encoding_g2.json'
  });

  logger.info("=== codify testfile2.json");
  await codify({
    source: {
      smt: "json|./test/data/|testfile2.json|*"
    },
    outputFile1: './test/output/json_encoding2_1.json',
    outputFile2: './test/output/json_encoding2_2.json'
  });

}

tests();
