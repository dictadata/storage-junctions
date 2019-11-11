/**
 * test/mysql
 */
"use strict";

const dull = require('./_dull');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql dull");
  await dull({
    source: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  });

}

tests();
