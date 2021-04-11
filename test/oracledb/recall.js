/**
 * test/oracledb
 */
"use strict";

const recall = require('../lib/_recall');
const { logger } = require('../../storage/utils');

logger.info("=== Test: oracledb");

async function tests() {

  logger.info("=== oracledb recall");
  if (await recall({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./data/output/oracledb/recall_01.json"
    }
  })) return 1;

  logger.info("=== oracledb recall");
  if (await recall({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    },
    terminal: {
      output: "./data/output/oracledb/recall_02.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
