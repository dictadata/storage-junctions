/**
 * test/transport
 */
"use strict";

const recall = require('../lib/_recall');
const { logger } = require('../../storage/utils');

logger.info("=== Test: transport");

async function tests() {

  logger.info("=== transport recall");
  if (await recall({
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
  })) return 1;

  logger.info("=== transport recall");
  if (await recall({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
