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
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'one'
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
