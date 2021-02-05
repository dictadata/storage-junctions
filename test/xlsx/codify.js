/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: xlsx Codify");

async function tests() {

  logger.info("=== codify foofile.xlsx|foo");
  await codify({
    origin: {
      smt: "xlsx|./test/data/foofile.xlsx|foo|*"
    },
    outputFile1: './output/xlsx_encoding_1.json',
    outputFile2: './output/xlsx_encoding_2.json'
  });

  logger.info("=== codify foofile.xls|foo");
  await codify({
    origin: {
      smt: "xls|./test/data/foofile.xls|foo|*"
    },
    outputFile1: './output/xls_encoding_1.json',
    outputFile2: './output/xls_encoding_2.json'
  });

}

(async () => {
  await tests();
})();
