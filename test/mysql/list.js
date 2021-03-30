/**
 * test/mysql list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../storage/logger');

logger.info("=== tests: mysql list");

async function tests() {

  logger.info("=== list");
  await list({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./data/output/mysql/list.json"
    }
  });

}

(async () => {
  await tests();
})();
