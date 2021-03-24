/**
 * test/oracledb
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../storage/logger');

logger.info("=== Test: oracledb");

async function tests() {

  logger.info("=== oracledb dull");
  await dull({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  });

}

(async () => {
  await tests();
})();
