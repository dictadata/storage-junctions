/**
 * test/memory
 */
"use strict";

const dull = require('../_dull');
const { logger } = require('@dictadata/lib');

logger.info("=== Tests: memory");

async function keystore() {

  logger.info("=== memory dull !Foo");
  if (await dull({
    origin: {
      smt: "memory|testgroup|foo_schema|!Foo",
      pattern: {
        key: 'one'
      }
    }
  })) return 1;

}

async function primarykey() {

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

exports.runTests = async () => {
  if (await keystore()) return 1;
  //if (await primarykey()) return 1;
};
