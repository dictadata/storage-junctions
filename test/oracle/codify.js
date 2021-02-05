/**
 * test/codify
 */
"use strict";

const codify = require('../lib/_codify');
const logger = require('../../lib/logger');

logger.info("=== tests: MySQL Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  await codify({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema|=Foo"
    },
    outputFile1: './output/oracle_codify_01.json',
    outputFile2: './output/oracle_codify_02.json'
  });

  logger.info("=== codify foo_schema_01");
  await codify({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_01|=Foo"
    },
    outputFile1: './output/oracle_codify_11.json',
    outputFile2: './output/oracle_codify_12.json'
  });

  logger.info("=== codify foo_schema_02");
  await codify({
    origin: {
      smt: "oracle|connectString=localhost/xepdb1;user=dicta;password=data|foo_schema_02|=Foo"
    },
    outputFile1: './output/oracle_codify_21.json',
    outputFile2: './output/oracle_codify_22.json'
  });

}

(async () => {
  await tests();
})();
