/**
 * test/memory list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: memory list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "memory|testgroup|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./test/data/output/memory/list.json"
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await tests()) return 1;
};
