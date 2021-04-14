/**
 * test/memory
 */
"use strict";

const dull = require('../lib/_dull');
const { logger } = require('../../storage/utils');

logger.info("=== Tests: memory");

async function tests() {

  logger.info("=== memory dull !Foo");
  if (await dull({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo",
      pattern: {
        key: 'one'
      }
    }
  })) return 1;

  logger.info("=== memory dull =Foo");
  if (await dull({
    origin: {
      smt: "memory|testgroup|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
