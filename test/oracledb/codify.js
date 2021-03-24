/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../storage/logger');

logger.info("=== tests: MySQL Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  await codify({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo"
    },
    outputFile1: './output/oracledb/codify_01.json',
    outputFile2: './output/oracledb/codify_02.json'
  });

  logger.info("=== codify foo_schema_01");
  await codify({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|=Foo"
    },
    outputFile1: './output/oracledb/codify_11.json',
    outputFile2: './output/oracledb/codify_12.json'
  });

  logger.info("=== codify foo_schema_02");
  await codify({
    origin: {
      smt: "oracledb|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|=Foo"
    },
    outputFile1: './output/oracledb/codify_21.json',
    outputFile2: './output/oracledb/codify_22.json'
  });

}

(async () => {
  await tests();
})();
