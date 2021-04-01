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
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema|=Foo"
    },
    outputFile1: './data/output/mssql/codify_01.json',
    outputFile2: './data/output/mssql/codify_02.json'
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_01|=Foo"
    },
    outputFile1: './data/output/mssql/codify_11.json',
    outputFile2: './data/output/mssql/codify_12.json'
  })) return 1;

  logger.info("=== codify foo_schema_02");
  if (await codify({
    origin: {
      smt: "mssql|server=localhost;userName=dicta;password=data;database=storage_node|foo_schema_02|=Foo"
    },
    outputFile1: './data/output/mssql/codify_21.json',
    outputFile2: './data/output/mssql/codify_22.json'
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
