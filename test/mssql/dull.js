/**
 * test/mssql
 */
"use strict";

const dull = require('../lib/_dull');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql dull");
  if (await dull({
    origin: {
      smt: "mssql|server=dev.dictadata.org;database=storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'one'
        }
      }
    },
    terminal: {
      output: "./data/output/mssql/dull_01.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
