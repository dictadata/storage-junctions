/**
 * test/oracle
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../lib/logger');

logger.info("=== Test: oracle");

async function tests() {

  logger.info("=== oracle recall");
  await recall({
    origin: {
      smt: "oracle|connectString=localhost/XE;user=dicta;password=data|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./test/output/oracle_recall.json"
    }
  });

  logger.info("=== oracle recall");
  await recall({
    origin: {
      smt: "oracle|connectString=localhost/XE;user=dicta;password=data|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  });

}

tests();
