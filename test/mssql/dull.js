/**
 * test/mssql
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../lib/logger');

logger.info("=== Test: mssql");

async function tests() {

  logger.info("=== mssql dull");
  await dull({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  });

}

tests();
