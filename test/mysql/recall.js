/**
 * test/mysql
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../lib/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql recall");
  await recall({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  });

  logger.info("=== mysql recall");
  await recall({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=dicta;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  });

}

tests();
