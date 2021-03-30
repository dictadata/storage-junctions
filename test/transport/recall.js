/**
 * test/transport
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../storage/logger');

logger.info("=== Test: transport");

async function tests() {

  logger.info("=== transport recall");
  await recall({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./data/output/transport/recall.json"
    }
  });

  logger.info("=== transport recall");
  await recall({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  });

}

(async () => {
  await tests();
})();
