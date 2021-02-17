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
    origin: {
      smt: "json|./test/data/|foofile.json|*"
    },
    outputFile1: './output/json/encoding_1.json',
    outputFile2: './output/json/encoding_2.json'
  });

  logger.info("=== codify foofile.json.gz");
  await codify({
    origin: {
      smt: "json|./test/data/|foofile.json.gz|*"
    },
    outputFile1: './output/json/encoding_g1.json',
    outputFile2: './output/json/encoding_g2.json'
  });

  logger.info("=== codify foofile__01.json");
  await codify({
    origin: {
      smt: "json|./test/data/|foofile_01.json|*"
    },
    outputFile1: './output/json/encoding_m1.json',
    outputFile2: './output/json/encoding_m2.json'
  });

  logger.info("=== codify foofile__02.json");
  await codify({
    origin: {
      smt: "json|./test/data/|foofile_02.json|*"
    },
    outputFile1: './output/json/encoding_l1.json',
    outputFile2: './output/json/encoding_l2.json'
  });
}

(async () => {
  await tests();
})();
