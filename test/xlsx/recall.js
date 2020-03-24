/**
 * test/xlsx/recall
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../logger');

logger.info("=== Test: xlsx");


async function tests() {

  logger.info("=== xlsx recall");
  await recall({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      },
      options: {
        logger: logger
      }
    }
  });

  logger.info("=== xlsx recall");
  await recall({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      },
      options: {
        logger: logger
      }
    }
  });

}

tests();
