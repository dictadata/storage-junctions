/**
 * test/transportdb list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../storage/logger');

logger.info("=== tests: transportdb list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./data/output/transportdb/list.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
