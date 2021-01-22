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
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|=Foo"
    },
    outputFile1: './test/output/mysql_codify_01.json',
    outputFile2: './test/output/mysql_codify_02.json'
  });

  logger.info("=== codify foo_schema_01");
  await codify({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_01|=Foo"
    },
    outputFile1: './test/output/mysql_codify_11.json',
    outputFile2: './test/output/mysql_codify_12.json'
  });

  logger.info("=== codify foo_schema_02");
  await codify({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema_02|=Foo"
    },
    outputFile1: './test/output/mysql_codify_21.json',
    outputFile2: './test/output/mysql_codify_22.json'
  });

}

tests();
