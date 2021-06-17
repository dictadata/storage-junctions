/**
 * test/memory
 */
"use strict";

const recall = require('../lib/_recall');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: memory");

async function keystore() {

  logger.info("=== memory recall");
  if (await recall({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo",
      pattern: {
        key: 'twenty'
      }
    },
    terminal: {
      output: "./test/data/output/memory/recall_1.json"
    }
  })) return 1;

}

async function primarykey() {
  logger.info("=== memory recall");
  if (await recall({
    origin: {
      smt: "memory|testgroup|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./test/data/output/memory/recall_2.json"
    }
  })) return 1;

}

exports.runTests = async () => {
  if (await keystore()) return 1;
  //if (await primarykey()) return 1;
};
