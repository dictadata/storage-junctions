/**
 * test/mssql
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../storage/logger');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql dull");
  if (await dull({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
