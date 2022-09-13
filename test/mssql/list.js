/**
 * test/mssql list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: mssql list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "mssql|server=localhost;database=storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./data/output/mssql/list.json"
    }
  }, 1)) return 1;

}

(async () => {
  if (await tests()) return;
})();
