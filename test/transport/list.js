/**
 * test/transport list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../storage/logger');

logger.info("=== tests: transport list");

async function tests() {

  logger.info("=== list");
  await list({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./data/output/transport/list.json"
    }
  });

}

(async () => {
  await tests();
})();
