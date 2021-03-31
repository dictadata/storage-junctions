/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../storage/logger');

logger.info("=== tests: MySQL Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  if (await codify({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema|=Foo"
    },
    outputFile1: './data/output/transport/codify_01.json',
    outputFile2: './data/output/transport/codify_02.json'
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_01|=Foo"
    },
    outputFile1: './data/output/transport/codify_11.json',
    outputFile2: './data/output/transport/codify_12.json'
  })) return 1;

  logger.info("=== codify foo_schema_02");
  if (await codify({
    origin: {
      smt: "transport|http://localhost:8089/transport/storage_node|foo_schema_02|=Foo"
    },
    outputFile1: './data/output/transport/codify_21.json',
    outputFile2: './data/output/transport/codify_22.json'
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
