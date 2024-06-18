/**
 * test/mysql list
 */
"use strict";

const list = require('../_lib/_list');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: mysql list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./test/_data/output/mysql/list.json"
    }
  }, 1)) return 1;

}

(async () => {
  if (await tests()) return;
})();
