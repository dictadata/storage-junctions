/**
 * test/codify
 */
"use strict";

const codify = require('./_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: Codify");

async function tests() {
  await codify({
    source: {
      smt: "json|./test/data/|testfile.json|*",
      options: {}
    },
    outputFile1: './test/output/json_encoding_1.json',
    outputFile2: './test/output/json_encoding_2.json'
  });

  await codify({
    source: {
      smt: "json|S3:dictadata.org/subfolder|testfile.json.gz|*",
      options: {}
    },
    outputFile1: './test/output/json_encoding_g1.json',
    outputFile2: './test/output/json_encoding_g2.json'
  });

}

tests();
