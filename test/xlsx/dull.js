/**
 * test/xlsx/dull
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../lib/logger');

logger.info("=== Test: xlsx");


async function tests() {

  logger.info("=== xlsx dull");
  await dull({
    source: {
      smt: "xlsx|test/output/foofile.xlsx|foo|*",
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

}

tests();
