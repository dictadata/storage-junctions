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
    source: {
      smt: "elasticsearch|http://localhost:9200|*|*",
      options: {
        list: {
          schema: "foo*"
        }
      }
    },
    outputFile: "./test/output/elastic_list.json"
  });

}

tests();