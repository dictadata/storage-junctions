/**
 * test/elasticsearch list
 */
"use strict";

const list = require('../lib/_list');
const logger = require('../../lib/logger');

logger.info("=== tests: elasticsearch list");

async function tests() {

  logger.info("=== list");
  await list({
    origin: {
      smt: "elasticsearch|http://localhost:9200|*|*",
      options: {
        schema: "foo*"
      }
    },
    terminal: {
      output: "./output/elasticsearch_list.json"
    }
  });

}

(async () => {
  await tests();
})();
