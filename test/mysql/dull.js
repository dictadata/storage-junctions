/**
 * test/mysql
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql dull");
  await dull({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  });

}

tests();
