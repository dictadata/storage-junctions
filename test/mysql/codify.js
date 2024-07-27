/**
 * test/codify
 */
"use strict";

const codify = require('../_lib/_codify');
const { logger } = require('@dictadata/lib');

logger.info("=== tests: MySQL Codify ");

async function tests() {

  logger.info("=== codify foo_schema");
  if (await codify({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|=Foo"
    },
    terminal: {
      output: './test/_data/output/mysql/codify_00.engram.json'
    }
  })) return 1;

  logger.info("=== codify foo_schema_01");
  if (await codify({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema_01|=Foo"
    },
    terminal: {
      output: './test/_data/output/mysql/codify_01.engram.json'
    }
  })) return 1;

  logger.info("=== codify foo_widgets");
  if (await codify({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_widgets|=Foo"
    },
    terminal: {
      output: './test/_data/output/mysql/codify_02.engram.json'
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
