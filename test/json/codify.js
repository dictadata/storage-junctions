/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: Codify");

async function tests() {

  logger.info("=== codify foofile.json");
  if (await codify({
    origin: {
      smt: "json|./data/input/|foofile.json|*"
    },
    output: './data/output/json/codify_1.json'
  })) return 1;

  logger.info("=== codify foofile.json.gz");
  if (await codify({
    origin: {
      smt: "json|./data/input/|foofile.json.gz|*"
    },
    output: './data/output/json/codify_g1.json'
  })) return 1;

  logger.info("=== codify foofile_01.json");
  if (await codify({
    origin: {
      smt: "json|./data/input/|foofile_01.json|*"
    },
    output: './data/output/json/codify_m1.json'
  })) return 1;

  logger.info("=== codify foofile_02.json");
  if (await codify({
    origin: {
      smt: "json|./data/input/|foofile_02.json|*"
    },
    output: './data/output/json/codify_l1.json'
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
