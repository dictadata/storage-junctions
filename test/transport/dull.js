/**
 * test/transportdb
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../storage/logger');

logger.info("=== Test: transportdb");

async function tests() {

  logger.info("=== transportdb dull");
  if (await dull({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
