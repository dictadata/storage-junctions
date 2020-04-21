/**
 * test/s3_list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: xlsx list");

async function tests() {

  logger.info("=== list xlsx sheets (forEach)");
  await list({
    origin: {
      smt: "xlsx|test/data/foofile.xlsx|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: "./test/output/xlsx_list.json"
  });

}

async function main() {
  await tests();
}

main();
