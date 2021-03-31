/**
 * test/transportdb
 */
"use strict";

const recall = require('../lib/_recall');
const logger = require('../../storage/logger');

logger.info("=== Test: transportdb");

async function tests() {

  logger.info("=== transportdb recall");
  if (await recall({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./data/output/transportdb/recall.json"
    }
  })) return 1;

  logger.info("=== transportdb recall");
  if (await recall({
    origin: {
      smt: "transportdb|http://localhost:8089/transportdb/storage_node|foo_schema|*",
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
