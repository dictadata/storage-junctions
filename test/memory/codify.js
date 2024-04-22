/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: memory codify");

async function tests() {

  logger.info("=== codify foo_schema");
  if (await codify({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo"
    },
    terminal: {
      output: './test/data/output/memory/codify_00.json'
    }
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "memory|testgroup|foo_schema_01|!Foo"
    },
    terminal: {
      output: './test/data/output/memory/codify_01.json'
    }
  })) return 1;

  logger.info("=== codify foo_widgets");
  if (await codify({
    origin: {
      smt: "memory|testgroup|foo_widgets|!Foo"
    },
    terminal: {
      output: './test/data/output/memory/codify_02.json'
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await tests()) return 1;
};
