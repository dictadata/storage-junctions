/**
 * test/codify
 */
"use strict";

const codify = require('./_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: Codify");

async function tests() {

  logger.info("=== codify testfile.json");
  await codify({
    source: {
      smt: "json|./test/data/|testfile.json|*"
    },
    outputFile1: './test/output/json_encoding_1.json',
    outputFile2: './test/output/json_encoding_2.json'
  });

  logger.info("=== codify testfile2.json");
  await codify({
    source: {
      smt: "json|./test/data/|testfile2.json|*"
    },
    outputFile1: './test/output/json_encoding2_1.json',
    outputFile2: './test/output/json_encoding2_2.json'
  });

  logger.info("=== codify S3 testfile.json.gz");
  await codify({
    source: {
      smt: "json|S3:dictadata.org/test/data/|testfile.json.gz|*"
    },
    outputFile1: './test/output/json_encoding_g1.json',
    outputFile2: './test/output/json_encoding_g2.json'
  });

  logger.info("=== codify 00.log.gz");
  await codify({
    source: {
      smt: "jsonl|./test/data/|00.log.gz|*"
    },
    codify: {
      "statistics": true
    },
    outputFile1: './test/output/json_encoding_lg1.json',
    outputFile2: './test/output/json_encoding_lg2.json'
  });

}

tests();
