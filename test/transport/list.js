/**
 * test/transport list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: transport list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./test/data/output/transport/list.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
