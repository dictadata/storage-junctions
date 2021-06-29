/**
 * test/mysql list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: mysql list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./test/data/output/mysql/list.json"
    }
  }, false)) return 1;

}

(async () => {
  if (await tests()) return;
})();
