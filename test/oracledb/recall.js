/**
 * test/oracledb
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../storage/logger');

logger.info("=== Test: oracledb");

async function tests() {

  logger.info("=== oracledb recall");
  await recall({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./data/output/oracledb/recall.json"
    }
  });

  logger.info("=== oracledb recall");
  await recall({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
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
