/**
 * test/mysql
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../storage/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql recall");
  await recall({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./data/output/mysql/recall.json"
    }
  });

  logger.info("=== mysql recall");
  await recall({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  });

}

(async () => {
  await tests();
})();
