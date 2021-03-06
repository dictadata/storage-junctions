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
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./test/data/output/mssql/list.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
