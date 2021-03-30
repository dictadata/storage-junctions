/**
 * test/transport
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../storage/logger');

logger.info("=== Test: transport");

async function tests() {

  logger.info("=== transport dull");
  if (await dull({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*",
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
