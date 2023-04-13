/**
 * test/mysql
 */
"use strict";

const dull = require('../lib/_dull');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql dull");
  if (await dull({
    origin: {
      smt: "mysql|host=dev.dictadata.net;database=storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'one'
        }
      }
    },
    terminal: {
      output: "./data/output/mysql/dull_01.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
