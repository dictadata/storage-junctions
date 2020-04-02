/**
 * test/mysql list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: mysql list");

async function tests() {

  logger.info("=== list");
  await list({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|*|*",
      options: {
        list: {
          schema: "foo*"
        }
      }
    },
    outputFile: "./test/output/mysql_list.json"
  });

}

tests();
