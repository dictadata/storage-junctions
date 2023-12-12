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
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|=Foo"
    },
    output: './test/data/output/mysql/codify_00.json'
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema_01|=Foo"
    },
    output: './test/data/output/mysql/codify_01.json'
  })) return 1;

  logger.info("=== codify foo_schema_02");
  if (await codify({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema_02|=Foo"
    },
    output: './test/data/output/mysql/codify_02.json'
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
