/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: MS SQL Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  if (await codify({
    origin: {
      smt: "mssql|server=localhost;database=storage_node|foo_schema|=Foo"
    },
    output: './data/output/mssql/codify_00.json'
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "mssql|server=localhost;database=storage_node|foo_schema_01|=Foo"
    },
    output: './data/output/mssql/codify_01.json'
  })) return 1;

  logger.info("=== codify foo_schema_02");
  if (await codify({
    origin: {
      smt: "mssql|server=localhost;database=storage_node|foo_schema_02|=Foo"
    },
    output: './data/output/mssql/codify_02.json'
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
