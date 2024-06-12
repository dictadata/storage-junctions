/**
 * test/elasticsearch list
 */
"use strict";

const list = require('../_list');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: elasticsearch list");

async function tests() {

  logger.info("=== list");
  if (await list({
    origin: {
      smt: "elasticsearch|http://dev.dictadata.net:9200|*|*",
      options: {
        schema: "foo?schema*"
      }
    },
    terminal: {
      output: "./test/data/output/elasticsearch/list.json"
    }
  }, 1)) return 1;

}

(async () => {
  if (await tests()) return;
})();
