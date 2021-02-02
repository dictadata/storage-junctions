/**
 * test/oracle
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../lib/logger');

logger.info("=== Test: oracle");

async function tests() {

  logger.info("=== oracle dull");
  await dull({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  });

}

tests();
