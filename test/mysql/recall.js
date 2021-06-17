/**
 * test/mysql
 */
"use strict";

const recall = require('../lib/_recall');
const { logger } = require('../../storage/utils');

logger.info("=== Test: mysql");

async function tests() {

  logger.info("=== mysql recall");
  if (await recall({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|=Foo",
      pattern: {
        match: {
          Foo: 'twenty'
        }
      }
    },
    terminal: {
      output: "./test/data/output/mysql/recall_01.json"
    }
  })) return 1;

  logger.info("=== mysql recall");
  if (await recall({
    origin: {
      smt: "mysql|host=localhost;user=dicta;password=data;database=storage_node|foo_schema|*",
      pattern: {
        match: {
          Foo: 'ten'
        }
      }
    },
    terminal: {
      output: "./test/data/output/mysql/recall_02.json"
    }
  })) return 1;

}

(async () => {
  if (await tests()) return;
})();
