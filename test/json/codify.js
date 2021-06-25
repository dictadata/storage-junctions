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
      smt: "json|./test/data/input/|foofile.json|*"
    },
    outputFile1: './test/data/output/json/encoding_1.json',
    outputFile2: './test/data/output/json/encoding_2.json'
  })) return 1;

  logger.info("=== codify foofile.json.gz");
  if (await codify({
    origin: {
      smt: "json|./test/data/input/|foofile.json.gz|*"
    },
    outputFile1: './test/data/output/json/encoding_g1.json',
    outputFile2: './test/data/output/json/encoding_g2.json'
  })) return 1;

  logger.info("=== codify foofile__01.json");
  if (await codify({
    origin: {
      smt: "json|./test/data/input/|foofile_01.json|*"
    },
    outputFile1: './test/data/output/json/encoding_m1.json',
    outputFile2: './test/data/output/json/encoding_m2.json'
  })) return 1;

  logger.info("=== codify foofile__02.json");
  if (await codify({
    origin: {
      smt: "json|./test/data/input/|foofile_02.json|*"
    },
    outputFile1: './test/data/output/json/encoding_l1.json',
    outputFile2: './test/data/output/json/encoding_l2.json'
  })) return 1;
}

(async () => {
  if (await tests()) return;
})();
