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
    source: {
      smt: "xlsx|test/data/foofile.xlsx|*|*",
      options: {
        list: {
          schema: "foo*"
        }
      }
    },
    outputFile: "./test/output/xlsx_list.json"
  });

}

async function main() {
  await tests();
}

main();
