/**
 * test/oracledb
 */
"use strict";

const dull = require('../lib/_dull');
const { logger } = require('../../storage/utils');

logger.info("=== Test: oracledb");

async function tests() {

  logger.info("=== oracledb dull");
  if (await dull({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo",
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
