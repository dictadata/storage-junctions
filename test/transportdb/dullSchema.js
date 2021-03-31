/**
 * test/transportdb
 */
"use strict";

const dullSchema = require('../lib/_dullSchema');
const logger = require('../../storage/logger');

logger.info("=== Tests: transportdb dullSchema");

async function tests() {

  logger.info("=== transportdb dullSchema foo_schema_x");
  if (await dullSchema({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema_x|*"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
