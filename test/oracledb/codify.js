/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const { logger } = require('../../storage/utils');

logger.info("=== tests: MySQL Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  if (await codify({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo"
    },
    outputFile1: './test/data/output/oracledb/codify_01.json',
    outputFile2: './test/data/output/oracledb/codify_02.json'
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|=Foo"
    },
    outputFile1: './test/data/output/oracledb/codify_11.json',
    outputFile2: './test/data/output/oracledb/codify_12.json'
  })) return 1;

  logger.info("=== codify foo_schema_02");
  if (await codify({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|=Foo"
    },
    outputFile1: './test/data/output/oracledb/codify_21.json',
    outputFile2: './test/data/output/oracledb/codify_22.json'
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
