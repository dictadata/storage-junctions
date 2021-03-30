/**
 * test/mysql
 */
"use strict";

const dull = require('../lib/_dull');
const logger = require('../../storage/logger');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql dull");
  if (await dull({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
