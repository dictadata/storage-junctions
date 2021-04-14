/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: Memory Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  if (await codify({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo"
    },
    outputFile1: './data/output/memory/codify_01.json',
    outputFile2: './data/output/memory/codify_02.json'
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "memory|testgroup|foo_schema_01|!Foo"
    },
    outputFile1: './data/output/memory/codify_11.json',
    outputFile2: './data/output/memory/codify_12.json'
  })) return 1;

  logger.info("=== codify foo_schema_02");
  if (await codify({
    origin: {
      smt: "memory|testgroup|foo_schema_02|!Foo"
    },
    outputFile1: './data/output/memory/codify_21.json',
    outputFile2: './data/output/memory/codify_22.json'
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
