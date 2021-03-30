/**
 * test/mssql list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../storage/logger');

logger.info("=== tests: mssql list");

async function tests() {

  logger.info("=== list");
  await list({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./data/output/mssql/list.json"
    }
  });

}

(async () => {
  await tests();
})();
