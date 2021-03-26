/**
 * test/transport
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Tests: transport dullSchema");

async function tests() {

  logger.info("=== transport dullSchema foo_schema_x");
  await dullSchema({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_x|*"
    }
  });

}

(async () => {
  await tests();
})();
