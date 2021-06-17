/**
 * test/elasticsearch list
 */
"use strict";

const list = require('../lib/_list');
const { logger } = require('../../storage/utils');

logger.info("=== tests: elasticsearch list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "elasticsearch|http://localhost:9200|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./test/data/output/elasticsearch/list.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
